import { JSONContent } from "@tiptap/core";
import Token from "markdown-it/lib/token";
import { transformNodeToModel } from "../../../Comments/transformer/Transformer";
import Context from "../../Context/Context";
import { RenderableTreeNodes, Schema, SchemaType, Tag } from "../../Parser/Markdoc";
import { ParserOptions } from "../../Parser/Parser";
import MarkdownFormatter from "../Formatter/Formatter";
import { getSquareFormatter } from "../Formatter/Formatters/SquareFormatter";
import { schema } from "./schema";

export class Transformer {
	constructor(private _schemes: Record<string, Schema>, private _markdownFormatter: MarkdownFormatter) {}

	transformMdComponents(
		node: JSONContent,
		renderer: (content: string, context?: Context, parserOptions?: ParserOptions) => RenderableTreeNodes,
		context?: Context
	) {
		if (node?.content) node.content = node.content.map((n) => this.transformMdComponents(n, renderer, context));
		if (node?.marks) {
			let inlineMdIndex = node.marks.findIndex((mark) => mark.type === "inlineMd");
			if (inlineMdIndex !== -1) {
				node = {
					type: "inlineMd_component",
					attrs: {
						tag: renderer(node.text, context, { isOneElement: true, isBlock: false }) as any,
						text: node.text,
					},
				};
			}
		}
		if (node.type == "blockMd") {
			node = {
				type: "blockMd_component",
				attrs: {
					text: node.content[0].text,
					tag: renderer(node.content[0].text, context, { isOneElement: true, isBlock: true }) as any,
				},
				content: node.content,
			};
		}

		return node;
	}

	async transformTree(
		node: JSONContent,
		previousNode?: JSONContent,
		nextNode?: JSONContent,
		context?: Context
	): Promise<JSONContent> {
		if (
			JSON.stringify(node.content) ===
			JSON.stringify([{ type: "video", attrs: { title: null, path: null, isLink: true } }])
		) {
			node.content = [{ type: "paragraph", content: [] }];
		}
		if (node?.content) {
			const newContent = [];
			for (let i = 0; i < node.content.length; i++) {
				const value = node.content[i];
				newContent.push(
					await this.transformTree(
						value,
						i == 0 ? null : node.content[i - 1],
						i == node.content.length - 1 ? null : node.content[i + 1],
						context
					)
				);
			}
			node.content = newContent.flat().filter((n) => n);
		}

		if (nextNode?.type === "comment") {
			const commentBlock = await transformNodeToModel(nextNode, context);
			nextNode.attrs = { comments: [commentBlock] };
			nextNode.content = [node];
			return null;
		}

		if (node?.type === "paragraph" && node?.content?.[0]?.type === "image") {
			const text = node.content?.[2]?.text ?? null;
			node = node.content[0];
			if (text) node.attrs.title = text;
		}

		if (node.type === "blockMd") {
			const content = node.content;
			let text = this._markdownFormatter.render({ type: "doc", content }, {});
			node = { type: "blockMd", content: [this._getTextNode(text, true)] };
		}

		if (node?.marks) {
			let inlineMdIndex = node.marks.findIndex((mark) => mark.type === "inlineCut");
			if (inlineMdIndex !== -1) {
				let nextInlineMdIndex = -1;
				if (nextNode?.marks) nextInlineMdIndex = nextNode.marks.findIndex((mark) => mark.type === "inlineCut");
				if (
					nextInlineMdIndex !== -1 &&
					JSON.stringify(node?.marks[inlineMdIndex].attrs) ==
						JSON.stringify(nextNode?.marks[nextInlineMdIndex].attrs)
				) {
					nextNode.content = [
						{ type: node.type, text: node.text },
						{ type: nextNode.type, ...(nextNode?.text ? { text: nextNode?.text } : {}) },
					];
					nextNode.type = "inlineCut_component";
					nextNode.attrs = node?.marks[inlineMdIndex].attrs;
					nextNode.marks = null;
					node = null;
				} else {
					node = {
						type: "inlineCut_component",
						attrs: node?.marks[inlineMdIndex].attrs,
						content: [{ type: node.type, text: node.text }],
					};
				}
			}
		}
		if (node?.type == "inlineCut_component" && nextNode?.marks) {
			let nextInlineMdIndex = nextNode.marks.findIndex((mark) => mark.type === "inlineCut");
			if (
				nextInlineMdIndex !== -1 &&
				JSON.stringify(node?.attrs) == JSON.stringify(nextNode?.marks[nextInlineMdIndex].attrs)
			) {
				nextNode.content = [
					...node.content,
					{ type: nextNode.type, ...(nextNode?.text ? { text: nextNode?.text } : {}) },
				];
				nextNode.type = "inlineCut_component";
				nextNode.attrs = node?.attrs;
				nextNode.marks = null;
				node = null;
			}
		}

		return node;
	}

	transformToken(tokens: Token[]): Token[] {
		tokens = this._filterTokens(
			tokens.map((t, idx) => this._transformTokenPart1(t, idx == 0 ? null : tokens[idx - 1]))
		);

		tokens = this._filterTokens(
			tokens.map((t, idx) => this._transformTokenPart2(t, idx == 0 ? null : tokens[idx - 1]))
		);

		return tokens;
	}

	private _filterTokens(tokens: (Token | Token[])[]): Token[] {
		return tokens.flat().filter((n) => n);
	}

	private _transformTokenPart1(token: Token, previous?: Token, parent?: Token): Token | Token[] {
		if (token.type === "annotation") {
			if (!parent || parent.type !== "inline") return this._getInlineMdTokens(`{${token.info}}`);
			if (!parent.attrs) parent.attrs = {};
			if (token.meta?.attributes)
				token.meta?.attributes.forEach(({ name, value }) => (parent.attrs[name] = value));
			parent.attrs.info = token.info;
			return null;
		}

		if (token.type === "variable") return this._getInlineMdTokens(`{% ${token.info} %}`);

		if (token.tag) {
			if (token.tag === "tbody" || token.tag === "thead") return null;
			if (token.tag === "tr") {
				token.type = "tableRow" + token.type.slice(2);
				token.tag = "tableRow";
			}
			if (token.tag === "td") {
				token.type = "tableCell" + token.type.slice(2);
				token.tag = "tableCell";
			}
			if (token.tag === "th") {
				token.type = "tableHeader" + token.type.slice(2);
				token.tag = "tableHeader";
			}
		}

		if (token.type === "tag" || token.type === "tag_open" || token.type === "tag_close") {
			let attrs = {};
			if (token.meta?.attributes) token.meta?.attributes.forEach(({ name, value }) => (attrs[name] = value));
			const newNode = {
				type: token.meta.tag,
				tag: token.meta.tag,
				attrs,
			};

			if (!schema.nodes?.[newNode.type]) {
				const nodeSchema = this._schemes[newNode.type];
				const formatter = getSquareFormatter(nodeSchema);
				const tag = new Tag(newNode.type, newNode.attrs);

				if (token.type === "tag_open") {
					const content = formatter(tag, "", false, true);
					if (parent && parent.type == "inline") return this._getInlineMdOpenTokens(content);
					return [{ type: "blockMd_open", tag: "blockMd" }, ...this._getParagraphTokens(content)];
				}

				if (token.type === "tag_close") {
					const content = formatter(tag, "", true);
					if (parent && parent.type == "inline") return this._getInlineMdCloseTokens(content);
					return [...this._getParagraphTokens(content), { type: "blockMd_close", tag: "blockMd" }];
				}

				if (nodeSchema.type == SchemaType.block) {
					return this._getParagraphTokens(null, this._getInlineMdTokens(formatter(tag, "")));
				} else {
					if (!parent) return this._getParagraphTokens(null, this._getInlineMdTokens(formatter(tag, "")));
					return this._getInlineMdTokens(formatter(new Tag(newNode.type, newNode.attrs), ""));
				}
			}

			if (token.type === "tag_open") newNode.type = newNode.type + "_open";
			if (token.type === "tag_close") newNode.type = newNode.type + "_close";

			return newNode;
		}

		if (token?.children)
			token.children = this._filterTokens(
				token.children.map((t, idx) =>
					this._transformTokenPart1(t, idx == 0 ? null : token.children[idx - 1], token)
				)
			);

		return token;
	}

	private _transformTokenPart2(token: Token, previous?: Token, parent?: Token): Token | Token[] {
		if (token.tag === "cut" && parent?.type === "inline") {
			if (token.type === "cut_open") {
				token.type = "inlineCut_open";
				token.tag = "inlineCut";
			}
			if (token.type === "cut_close") {
				token.type = "inlineCut_close";
				token.tag = "inlineCut";
			}
		}

		if (token.type == "inline" && token.attrs) {
			if (previous.type !== "heading_open") {
				token.children.push(this._getInlineMdTokens(`{${token.attrs.info}}`));
			} else {
				if (!previous.attrs) previous.attrs = {};
				previous.attrs = { ...token.attrs, ...previous.attrs };
			}
		}

		if (token?.children)
			token.children = this._filterTokens(
				token.children.map((t, idx) =>
					this._transformTokenPart2(t, idx == 0 ? null : token.children[idx - 1], token)
				)
			);

		return token;
	}

	private _getTextNode(content?: string, unsetMark?: boolean) {
		if (unsetMark) return { type: "text", text: content };
		return { type: "text", marks: [{ type: "inlineMd" }], text: content };
	}

	private _getParagraphTokens(content?: string, children?: any[]) {
		return [
			{ type: "paragraph_open", tag: "p" },
			{
				type: "inline",
				tag: "",
				children: children ?? [...this._getInlineMdTokens(content)],
				content: content ?? "",
			},
			{ type: "paragraph_close", tag: "p" },
		];
	}

	private _getTextToken(content: string) {
		return { type: "text", content };
	}

	private _getInlineMdOpenTokens(content?: string) {
		const openToken = { type: "inlineMd_open", tag: "inlineMd" };
		if (!content) return openToken;
		return [openToken, this._getTextToken(content)];
	}

	private _getInlineMdCloseTokens(content?: string) {
		const closeToken = { type: "inlineMd_close", tag: "inlineMd" };
		if (!content) return closeToken;
		return [this._getTextToken(content), closeToken];
	}

	private _getInlineMdTokens(content: string) {
		return [this._getInlineMdOpenTokens(), this._getTextToken(content), this._getInlineMdCloseTokens()];
	}
}
