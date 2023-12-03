const Page = require('./helpers/page')

let page;

beforeEach(async() => {

    page = await Page.build();
    await page.goto('localhost:3000');
})

afterEach(async() => {
    await page.close();
})

test('should run test browser', async () => {
    const logoText = await page.getContentsOf('a.brand-logo');
    expect(logoText).toEqual('Blogster');
})

test('should start Google Auth flow on clicking "Login With Google"', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test('should show "Log out" button when logged in', async () => {
    await page.login();
    await page.waitFor('a[href="/auth/logout"]');

    const logOutText = await page.getContentsOf('a[href="/auth/logout"]');
    expect(logOutText).toEqual('Logout');
})

