import { Schema } from "prosemirror-model";

export const schema = new Schema({
	nodes: {
		doc: { content: "block+" },
		horizontal_rule: { group: "block" },
		thead: { content: "tr", group: "block" },
		tbody: { content: "tr*", group: "block" },
		th: { content: "inline*", group: "block" },
		td: { content: "inline*", group: "block" },
		tr: { content: "(th | td)*", group: "block" },
		paragraph: { content: "inline*", group: "block" },
		blockquote: { content: "block+", group: "block" },
		table: { content: "(thead | tbody)*", group: "block" },
		list_item: { content: "paragraph block*", defining: true },
		bullet_list: { content: "list_item+", group: "block", attrs: { tight: { default: false } } },
		heading: { attrs: { level: { default: 1 } }, content: "(text | image)*", group: "block", defining: true },

		code_block: {
			marks: "",
			code: true,
			defining: true,
			group: "block",
			content: "text*",
			attrs: { params: { default: "" } },
		},
		ordered_list: {
			group: "block",
			content: "list_item+",
			attrs: { order: { default: 1 }, tight: { default: false } },
		},

		text: { group: "inline" },
		hard_break: { inline: true, group: "inline", selectable: false },

		image: {
			inline: true,
			group: "inline",
			draggable: true,
			attrs: { src: {}, alt: { default: null }, title: { default: null } },
		},

		note: {
			content: "block+",
			group: "block",
			attrs: { type: { default: null }, title: { default: null } },
		},
		blockMd: { content: "block+", group: "block", defining: true, marks: "" },

		error: {
			atom: true,
			group: "block",
			selectable: false,
			attrs: { message: { default: null } },
		},

		br: { atom: true, inline: true, group: "inline", selectable: false },
		// cmd: { attrs: { text: { default: null }, name: { default: null } }, atom: true, inline: true, group: "inline" },

		link_component: {
			atom: true,
			inline: true,
			group: "inline",
			attrs: { text: { default: null }, href: { default: null } },
		},
	},
	marks: {
		s: {},
		em: {},
		code: {},
		strong: {},
		link: { attrs: { href: {}, title: { default: null } }, inclusive: false },

		inlineMd: {},
	},
});
