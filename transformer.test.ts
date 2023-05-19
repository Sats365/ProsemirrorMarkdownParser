import { parser } from "../../../../app";
import getNodeElementRenderModels from "../../../../extensions/markdown/core/getRenderElemets/getNodeElementRenderModels";
import getTagElementRenderModels from "../../../../extensions/markdown/core/getRenderElemets/getTagElementRenderModels";
import { catalogMarkdown, emptyArticleItemRef } from "../../../Library/test/data/markdown";
import Context from "../../Context/Context";
import TestContext from "../../Context/TestContext";
// import { Transformer } from "./Transformer";

const parseContext: Context = new TestContext(
	parser.parse.bind(parser),
	parser.renderMarkdownIt.bind(parser),
	emptyArticleItemRef,
	catalogMarkdown
);
const schemes = { ...getTagElementRenderModels(parseContext), ...getNodeElementRenderModels(parseContext) };

// const transformer = new Transformer(schemes, formatter);

test("test", () => {
	expect("1").toEqual("1");
});
