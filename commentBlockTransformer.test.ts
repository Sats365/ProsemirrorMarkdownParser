import { CommentBlock } from "../../../../components/Comments/CommentBlockInterface";
import { transformModelToNode, transformNodeToModel } from "./commentBlockTransformer";

describe("Трансформер правильно трансформирует ", () => {
	const node = {
		type: "comment",
		attrs: { mail: "user1@ics-it.ru", dateTime: "2022-09-06T09|29|40.612Z", isResolved: false },
		content: [
			{ type: "paragraph", content: [{ type: "text", text: "comment text" }] },
			{
				type: "answer",
				attrs: { mail: "user2@ics-it.ru", dateTime: "2022-09-06T09|29|40.612Z" },
				content: [{ type: "paragraph", content: [{ type: "text", text: "answer text 1" }] }],
			},
			{
				type: "answer",
				attrs: { mail: "user3@ics-it.ru", dateTime: "2022-09-06T09|29|40.612Z" },
				content: [{ type: "paragraph", content: [{ type: "text", text: "answer text 2" }] }],
			},
		],
	};

	const model: CommentBlock = {
		comment: {
			userMail: "user1@ics-it.ru",
			userName: "user1@ics-it.ru",
			dateTime: "2022-09-06T09:29:40.612Z",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: "comment text" }],
				},
			],
		},
		answers: [
			{
				userMail: "user2@ics-it.ru",
				userName: "user2@ics-it.ru",
				dateTime: "2022-09-06T09:29:40.612Z",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "answer text 1" }],
					},
				],
			},
			{
				userMail: "user3@ics-it.ru",
				userName: "user3@ics-it.ru",
				dateTime: "2022-09-06T09:29:40.612Z",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "answer text 2" }],
					},
				],
			},
		],
	};

	test("Node в модель", () => {
		const transformedNode = transformNodeToModel(node);

		expect(transformedNode).toEqual(model);
	});

	test("Модель в Node", () => {
		const transformedModel = transformModelToNode(Object.assign({}, model));

		expect(transformedModel).toEqual(node);
	});
});
