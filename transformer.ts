import Token from "markdown-it/lib/token";
import { Schema, SchemaType, Tag } from "../Markdoc";
import { getSquareFormatter } from "../MarkdownFormatter/Formatter/SquareFormatter";
import MarkdownFormatter from "../MarkdownFormatter/MarkdownFormatter";
import { schema } from "./schema";

export class Transformer {
	constructor(private _schemes: Record<string, Schema>, private _markdownFormatter: MarkdownFormatter) {}

	postTransform(node: any) {
		if (JSON.stringify(node.content) === JSON.stringify([{ type: "horizontal_rule" }])) {
			node.content = [{ type: "paragraph", content: [{ type: "text", text: "null" }] }];
		}
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
			node = {
				type: "blockMd",
				content: [this._getTextNode(this._markdownFormatter.render({ type: "doc", content }, {}), true)],
			};
		}

		return node;
	}

	predTransform(token: Token[]): Token[] {
		let transformTokens = token
			.map((t) => this._predTransform(t))
			.flat()
			.filter((n) => n);
		return transformTokens;
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
				const formatter = getSquareFormatter(nodeSchema, {});
				const tag = new Tag(newNode.type, newNode.attrs);

				if (token.type === "tag_open") {
					const content = formatter(tag, "", {}, null, false, true);
					if (parent && parent.type == "inline") return this._getInlineMdOpenTokens(content);
					return [{ type: "blockMd_open", tag: "blockMd" }, ...this._getParagraphTokens(content)];
				}

				if (token.type === "tag_close") {
					const content = formatter(tag, "", {}, null, true);
					if (parent && parent.type == "inline") return this._getInlineMdCloseTokens(content);
					return [...this._getParagraphTokens(content), { type: "blockMd_close", tag: "blockMd" }];
				}

				if (nodeSchema.type == SchemaType.block) {
					return this._getParagraphTokens(null, this._getInlineMdTokens(formatter(tag, "", {})));
				} else {
					if (!parent) return this._getParagraphTokens(null, this._getInlineMdTokens(formatter(tag, "", {})));
					return this._getInlineMdTokens(formatter(new Tag(newNode.type, newNode.attrs), "", {}));
				}
			}

			if (token.type === "tag_open") newNode.type = newNode.type + "_open";
			if (token.type === "tag_close") newNode.type = newNode.type + "_close";
			return newNode;
		}
		if (token?.children)
			token.children = token.children
				.map((n) => this._predTransform(n, token))
				.flat()
				.filter((n) => n);
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
