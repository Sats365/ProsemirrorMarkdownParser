import { Schema } from "prosemirror-model";
import br from "../../../../extensions/markdown/elements/br/edit/brSchema";
import drawio from "../../../../extensions/markdown/elements/drawio/edit/model/drawioSchema";
import heading from "../../../../extensions/markdown/elements/heading/edit/model/headingSchema";
import image from "../../../../extensions/markdown/elements/image/edit/model/imageSchema";
import link from "../../../../extensions/markdown/elements/link/edit/model/linkSchema";
import bullet_list from "../../../../extensions/markdown/elements/list/edit/models/bulletList/bulletListSchema";
import list_item from "../../../../extensions/markdown/elements/list/edit/models/listItem/listItemSchema";
import ordered_list from "../../../../extensions/markdown/elements/list/edit/models/orderList/orderListSchema";
import video from "../../../../extensions/markdown/elements/video/edit/model/videoSchema";

export const schema = new Schema({
	nodes: {
		br,
		video,
		image,
		drawio,
		heading,
		list_item,
		bullet_list,
		ordered_list,

		text: { group: "inline" },
		doc: { content: "block+" },
		horizontal_rule: { group: "block" },
		table: { content: "tableRow+", group: "block" },
		tableRow: { content: "(tableCell | tableHeader)*", group: "block" },
		tableCell: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		tableHeader: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		tableCell_simple: { content: "inline+", group: "block" },
		tableHeader_simple: { content: "inline+", group: "block" },
		tableBodyRow_simple: { content: "tableCell_simple+", group: "block" },
		tableHeaderRow_simple: { content: "tableHeader_simple+", group: "block" },
		table_simple: { content: "(tableHeader_simple | tableCell_simple)*", group: "block" },
		paragraph: { content: "inline*", group: "block" },
		error: { content: "inline*", group: "block" },
		blockquote: { content: "block+", group: "block" },

		code_block: {
			marks: "",
			code: true,
			defining: true,
			group: "block",
			content: "text*",
			attrs: { params: { default: "" } },
		},

		hard_break: { inline: true, group: "inline", selectable: false },

		note: {
			content: "block+",
			group: "block",
			attrs: { type: { default: null }, title: { default: null } },
		},

		cut: {
			content: "block+",
			group: "block",
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: false } },
		},
		inlineCut_component: {
			group: "block",
			content: "inline*",
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: false } },
		},

		comment_block: {
			content: "block+",
			group: "block",
		},

		comment: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
				dateTime: { default: null },
				isResolved: { default: false },
			},
		},

		style_wrapper: {
			group: "block",
			content: "block+",
			attrs: {
				style: { default: null },
			},
		},

		answer: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
				dateTime: { default: null },
			},
		},

		comment_input: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
			},
		},

		blockMd: { content: "block+", group: "block", defining: true, marks: "" },

		inlineMd_component: {
			atom: true,
			inline: true,
			group: "inline",
			attrs: { text: { default: null }, tag: { default: null } },
		},
		blockMd_component: {
			marks: "",
			group: "block",
			defining: true,
			content: "text*",
			attrs: { text: { default: null }, tag: { default: null } },
		},
	},
	marks: {
		link,
		s: {},
		em: {},
		code: {},
		strong: {},
		inlineMd: {},
		inlineCut: {
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: true } },
		},
	},
});
