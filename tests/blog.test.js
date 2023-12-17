const Page = require('./helpers/page')

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async() => {
    await page.close();
});


describe('when user logged in', () => {

    beforeEach(async() => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('should show blog form after click on add button', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using invalid input values', async () => {

        beforeEach(async() => {
            await page.click('form button');
        })
        test('form should show error messages', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');

        })
    });

    describe('And using valid input values', async () => {

        beforeEach(async() => {
            await page.type('.title input', 'Valid title');
            await page.type('.content input', 'Valid content');
            await page.click('form button');
        })

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries')
        })

        test('submitting and then saving adds blog to the index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual('Valid title');
            expect(content).toEqual('Valid content');
        });

    });
});

describe('when user is not logged in', async () => {
    const apiCalls = [
        {
            method: 'get',
            path: '/api/blogs',
        },
        {
            method: 'post',
            path: '/api/blogs',
            body: { title: 'Valid title', content: 'Valid content' }
        },
    ];


    test('User can not create blog posts', async () => {
        const result = await Promise.all(apiCalls.map(({method, path, body}) => {
            return page[method](path, body);
        }));

        result.forEach((response) =>{
            expect(response).toEqual({ error: 'You must log in!'});
        })
    });

});
