import { JSONContent } from "@tiptap/core";
import Context from "../../Context/Context";

type NodeTransformerFunc = (
	node: JSONContent,
	previousNode?: JSONContent,
	nextNode?: JSONContent,
	context?: Context
) => Promise<{ isSet: boolean; value: JSONContent }>;

export default NodeTransformerFunc;
