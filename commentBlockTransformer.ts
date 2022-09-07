import { Comment, CommentBlock } from "../../../../components/Comments/CommentBlockInterface";
import { dateNormalize, dateScreening } from "./commentDateUtils";

export const transformNodeToModel = (node: any): CommentBlock => {
	const newNode = JSON.parse(JSON.stringify(node));

	const answers = newNode.content
		.map((c, idx) => {
			if (c.type === "answer") {
				newNode.content[idx] = null;
				return _getCommentFromNode(c);
			}
		})
		.filter((c) => c);

	newNode.content = newNode.content.filter((x: any) => x);

	const comment = _getCommentFromNode({ type: "comment", attrs: newNode.attrs, content: newNode.content });

	return {
		comment,
		answers,
	};
};

export const transformModelToNode = (model: CommentBlock): any => {
	const node = _getNodeFromComment(model.comment, true);
	const answerNodes = model.answers.map((answer: Comment) => _getNodeFromComment(answer, false));
	node.content.push(...answerNodes);
	return node;
};

const _getCommentFromNode = (node: any): Comment => {
	return {
		userMail: node.attrs.mail,
		userName: node.attrs.mail,
		dateTime: dateNormalize(node.attrs.dateTime),
		content: node.content,
	};
};

const _getNodeFromComment = (comment: Comment, isComment: boolean) => {
	const node = {
		type: isComment ? "comment" : "answer",
		attrs: {
			mail: comment.userMail,
			dateTime: dateScreening(comment.dateTime),
			isResolved: false,
		},
		content: comment.content,
	};
	if (!isComment) delete node.attrs.isResolved;

	return node;
};
