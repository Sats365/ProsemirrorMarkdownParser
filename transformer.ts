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

	finalTransform(
		node: JSONContent,
		renderer: (content: string, context?: Context, parserOptions?: ParserOptions) => RenderableTreeNodes,
		context?: Context
	) {
		if (node?.content) node.content = node.content.map((n) => this.finalTransform(n, renderer, context));
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

	async postTransform(
		node: JSONContent,
		previousNode?: any,
		nextNode?: any,
		context?: Context
	): Promise<JSONContent> {
		if (JSON.stringify(node.content) === JSON.stringify([{ type: "horizontal_rule" }])) {
			node.content = [{ type: "paragraph", content: [] }];
		}
		if (node?.content)
			node.content = (
				await Promise.all(
					node.content.map(
						async (n, i) =>
							await this.postTransform(
								n,
								i == 0 ? null : node.content[i - 1],
								i == node.content.length - 1 ? null : node.content[i + 1],
								context
							)
					)
				)
			)
				.flat()
				.filter((n) => n);

		if (node.type === "blockMd") {
			const content = node.content;
			let text = this._markdownFormatter.render({ type: "doc", content }, {});
			node = { type: "blockMd", content: [this._getTextNode(text, true)] };
		}

		if (nextNode?.type === "comment") {
			const commentBlock = await transformNodeToModel(nextNode, context);
			nextNode.attrs = { comments: [commentBlock] };
			nextNode.content = [node];
			return null;
		}

		if (node?.marks) {
			let inlineMdIndex = node.marks.findIndex((mark) => mark.type === "inlineCut");
			if (inlineMdIndex !== -1) {
				node = {
					type: "inlineCut_component",
					attrs: node?.marks[inlineMdIndex].attrs,
					content: [
						{
							type: node.type,
							text: node.text,
						},
					],
				};
			}
		}

		return node;
	}

	predTransform(token: Token[], parent?: Token): Token[] {
		let transformTokens = token
			.map((t) => this._predTransform(t, parent))
			.flat()
			.filter((n) => n);
		transformTokens = transformTokens
			.map((t) => this._predTransform2(t, parent))
			.flat()
			.filter((n) => n);
		return transformTokens;
	}

	private _getTextNode(content?: string, unsetMark?: boolean) {
		if (unsetMark) return { type: "text", text: content };
		return { type: "text", marks: [{ type: "inlineMd" }], text: content };
	}

	private _predTransform2(token: Token, parent?: Token): Token | Token[] {
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

		if (token?.children)
			token.children = token.children
				.map((t) => this._predTransform2(t, token))
				.flat()
				.filter((n) => n);

		return token;
	}

	private _predTransform(token: Token, parent?: Token): Token | Token[] {
		if (token.type === "annotation") return this._getInlineMdTokens(`{${token.info}}`);
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
		if (token?.children) token.children = this.predTransform(token.children, token);
		return token;
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
