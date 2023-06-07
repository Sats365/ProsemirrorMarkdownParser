import { JSONContent } from "@tiptap/core";
import ParserContext from "../../ParserContext/ParserContext";

type NodeTransformerFunc = (
	node: JSONContent,
	previousNode?: JSONContent,
	nextNode?: JSONContent,
	context?: ParserContext
) => Promise<{ isSet: boolean; value: JSONContent }> | { isSet: boolean; value: JSONContent };

export default NodeTransformerFunc;
