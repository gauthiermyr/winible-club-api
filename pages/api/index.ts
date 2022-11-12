export default async function handler(req, res) {

    const routes = {
        users: {
            cards : {
                params: [{name: '[address]', type: 'String'}],
                example: '/users/cards/0xC7C101C432a1f3E9e77f8910cabAC870159F1065',
                returns: {}
            }
        },
        cards: {
            metadata : {
                params: [{name: '[cardId]', type: 'Int'}],
                example: '/cards/metadata/1',
                returns: {}
            }
        },
    };

	res.status(200).json(routes);
}