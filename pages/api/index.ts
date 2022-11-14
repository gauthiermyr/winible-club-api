export default async function handler(req, res) {

    const routes = {
        users: {
            cards : {
                route: '/users/cards/[address]',
                params: [{name: '[address]', type: 'String'}],
                example: '/users/cards/0xC7C101C432a1f3E9e77f8910cabAC870159F1065',
                returns: {
                    user: "String",
                    owned: "Int",
                    cards: [
                        {
                            id: "Int",
                            level: {
                                id: "Int",
                                name: "String"
                            },
                            cellar: {
                                id: "String",
                                capacity: "Int"
                            },
                            metadata: "String"
                        },
                    ]
                }
            }
        },
        cards: {
            metadata : {
                route: '/cards/metadata/[cardId]',
                params: [{name: '[cardId]', type: 'Int'}],
                example: '/cards/metadata/1',
                returns: {}
            }
        },
    };

	res.status(200).json(routes);
}