import Token from "markdown-it/lib/token";
import { CliPrettify } from "markdown-table-prettify";
import Context from "../../Context/Context";
import { RenderableTreeNodes, Schema, SchemaType, Tag } from "../../Parser/Markdoc";
import { ParserOptions } from "../../Parser/Parser";
import MarkdownFormatter from "../Formatter/Formatter";
import { getSquareFormatter } from "../Formatter/Formatter/SquareFormatter";
import { schema } from "./schema";

export class Transformer {
	constructor(private _schemes: Record<string, Schema>, private _markdownFormatter: MarkdownFormatter) {}

	finalTransform(
		node: any,
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

	postTransform(node: any) {
		if (JSON.stringify(node.content) === JSON.stringify([{ type: "horizontal_rule" }]))
			node.content = [{ type: "paragraph", content: [] }];
		if (node?.content)
			node.content = node.content
				.map((n) => this.postTransform(n))
				.flat()
				.filter((n) => n);

		if (node.marks) {
			let index = node.marks.findIndex((mark) => mark.type === "link");
			if (index !== -1) {
				node.type = "link_component";
				node.attrs = { ...node.marks[index].attrs, text: node.text };
				delete node.marks;
				delete node.text;
			}
		}

		if (node.type === "image") {
			let attrs = node.attrs;
			return this._getTextNode(`![${attrs?.alt ?? ""}](${attrs.src}${attrs?.title ? ` "${attrs?.title}"` : ""})`);
		}

		if (node.type === "table" || node.type === "blockMd") {
			const content = node.type === "table" ? [node] : node.content;
			let text = this._markdownFormatter.render({ type: "doc", content }, {});
			if (node.type === "table") text = CliPrettify.prettify(text);
			node = { type: "blockMd", content: [this._getTextNode(text, true)] };
		}

		// if (node.type === "comment_block") {
		// 	node.content.push({
		// 		type: "comment_input",
		// 		content: [{ type: "paragraph", content: [] }],
		// 	});
		// }

		return node;
	}

	predTransform(token: Token[]): Token[] {
		let transformTokens = token
			.map((t) => this._predTransform(t))
			.flat()
			.filter((n) => n);
		return transformTokens;
	}

	tablesTransform(tokens: Token[]): Token[] {
		let isOpen = false;
		for (let idx = 0; idx < tokens.length; idx++) {
			const token = tokens[idx];
			if (token.type === "tag_open" && token.info === "table") {
				tokens.splice(idx + 1, 0, { type: "tbody_open", tag: "tbody" });
				isOpen = true;
			}
			if (token.type === "tag_close" && token.info === "/table") {
				tokens.splice(idx, 0, { type: "tbody_close", tag: "tbody" });
				isOpen = false;
				idx++;
			}
			if (isOpen) {
				if (token.type === "hr") {
					tokens.splice(idx, 1);
					idx--;
				}
				if (token.type === "bullet_list_open") tokens.splice(idx, 1, { type: "tr_open", tag: "tr" });
				if (token.type === "bullet_list_close") tokens.splice(idx, 1, { type: "tr_close", tag: "tr" });
				if (token.type === "list_item_open") {
					const isAnnotation = tokens[idx + 1].type === "annotation";
					const attrs = {};
					if (isAnnotation) tokens[idx + 1].meta.attributes.forEach((a) => (attrs[a.name] = a.value));

					tokens.splice(idx, isAnnotation ? 2 : 1, {
						type: "td_open",
						tag: "td",
						attrs: attrs,
						meta: isAnnotation ? tokens[idx + 1].meta : null,
					});
				}
				if (token.type === "list_item_close") tokens.splice(idx, 1, { type: "td_close", tag: "td" });
			}
			if (token?.children) token.children = this.tablesTransform(token.children);
		}

		for (let idx = 0; idx < tokens.length; idx++) {
			if (tokens[idx].type === "td_open" && tokens[idx + 1].type === "inline") {
				tokens.splice(idx + 1, 1, { type: "paragraph_open", tag: "p" }, tokens[idx + 1], {
					type: "paragraph_close",
					tag: "p",
				});
			}
		}
		return tokens;
	}

	private _getTextNode(content?: string, unsetMark?: boolean) {
		if (unsetMark) return { type: "text", text: content };
		return { type: "text", marks: [{ type: "inlineMd" }], text: content };
	}

	private _predTransform(token: Token, parent?: Token): Token | Token[] {
		if (token.type === "annotation") return this._getInlineMdTokens(`{${token.info}}`);
		if (token.type === "variable") return this._getInlineMdTokens(`{% ${token.info} %}`);
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
		if (token?.children) token.children = this.predTransform(token.children);
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
