import { formatter, parser } from "../../../pages/app";
import { catalogMarkdown, emptyArticleItemRef } from "../../Library/test/data/markdown";
import Context from "../Context/Context";
import TestContext from "../Context/TestContext";
import getNodeSchemes from "../Schemes/getNodeSchemes";
import getTagSchemes from "../Schemes/getTagSchemes";
import { Transformer } from "./Transformer";

const parseContext: Context = new TestContext(
	parser.parse.bind(parser),
	parser.renderMarkdownIt.bind(parser),
	emptyArticleItemRef,
	catalogMarkdown
);
const schemes = { ...getTagSchemes(parseContext), ...getNodeSchemes(parseContext) };

const transformer = new Transformer(schemes, formatter);
