export const entityConfigs = {

    user: {
        title: '회원 관리',
        endpoint: '/users',
        embeddedKey: 'users',
        icon: 'mdi-account',
        addButtonText: '회원 추가',
        createTitle: '회원 생성',
        updateTitle: '회원 수정',
        displayField: 'name',
        fieldKeys: ['name', 'email', 'phone']
    },

    computer: {
        title: '컴퓨터 관리',
        endpoint: '/computers',
        embeddedkey: 'computers',
        icon: 'mdi-desktop-tower',
        addButtonText: '컴퓨터 추가',
        createTitle: '컴퓨터 생성',
        updateTitle: '컴퓨터 수정',
        displayField: 'name',
        fieldKeys: ['name', 'type', 'price']
    },

    monitor: {
        title: '모니터 관리',
        endpoint: '/monitorss',
        embeddedkey: 'monitors',
        icon: 'mdi-monitor',
        addButtonText: '모니터 추가',
        createTitle: '모니터 생성',
        updateTitle: '모니터 수정',
        displayField: 'name',
        fieldKeys: ['name', 'price', 'size']
    }
};