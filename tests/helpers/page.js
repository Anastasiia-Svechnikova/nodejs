const puppeteer = require('puppeteer')
const userFactory = require("../factories/user-factory");
const sessionFactory = require("../factories/session-factory");

class CustomPage {
    static async build() {
        const browser  = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] ||  browser[property] || page[property] ;
            }
        })
    }


    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({name: 'session', value: session});
        await this.page.setCookie({name: 'session.sig', value: sig});

        await this.page.goto('localhost:3000/blogs');
    }

    getContentsOf(selector) {
        return this.page.$eval(selector, (el) => el.innerHTML);
    }

    get(path) {
       return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
            }).then((response) => response.json())
        }, path);
    }

    post(path, body) {
        return this.page.evaluate((_path, _body) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(_body)
            }).then((response) => response.json())
        }, path, body);
    }
}

module.exports = CustomPage;
