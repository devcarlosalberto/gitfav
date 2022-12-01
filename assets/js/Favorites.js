import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
    }

    async addUser(username) {
        const userExists = this.entries.find(entry => entry.login === username)

        try {
            if (userExists) throw new Error("Usuário já existe!")

            const user = await GithubUser.search(username)

            if (user.login === undefined) throw new Error("Usuário não encontrado!")

            this.entries = [user, ...this.entries]
            this.saveUsers()
        } catch(error) {
            alert(error)
        }
    }

    removeUser(user) {
        const filteredEntries = this.entries.filter(entry => entry.login != user.login)
        this.entries = filteredEntries
        this.saveUsers()
    }

    saveUsers() {
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
        this.updateView()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector("tbody")
        
        this.listeningInputs()
        this.updateView()
    }

    removeAllRows() {
        this.tbody.innerHTML = ''
    }

    createNewRow() {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td class="user">
            <img src="" alt="">
            <a href="" target="_blank">
                <p id="name"></p>
                <span id="login"></span>
            </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td><button class="remove">Remover</button></td>`
        return row
    }

    showEmptyTable() {
        this.tbody.innerHTML = `
        <tr class="empty-table">
            <td colspan="4">
                <span>Nenhum favorito ainda</span>
            </td>
        </tr>`
    }

    updateView() {
        this.removeAllRows()

        if (this.entries.length == 0) return this.showEmptyTable()

        this.entries.forEach(user => {
            const row = this.createNewRow()
            row.querySelector(".user img").src = `https://github.com/${user.login}.png`
            row.querySelector(".user img").alt = `Imagem de ${user.name}`
            row.querySelector(".user a").href = `https://github.com/${user.login}`
            row.querySelector(".user #name").textContent = user.name ? `${user.name}` : 'Nome não localizado'
            row.querySelector(".user #login").textContent = `/${user.login}`
            row.querySelector(".repositories").textContent = `${user.public_repos}`
            row.querySelector(".followers").textContent = `${user.followers}`
            row.querySelector(".remove").onclick = () => { this.onRemove(user) }
            this.tbody.append(row)
        })
    }

    listeningInputs() {
        this.root.querySelector(".search button").onclick = () => { this.onAdd() }
        this.root.querySelector(".search input").onkeyup = (e) => e.key == "Enter" ? this.onAdd() : null
    }

    onAdd() {
        const inputUsername = this.root.querySelector(".search input")
        const username = inputUsername.value
        inputUsername.value = ""

        this.addUser(username)
    }

    onRemove(username) {
        const isOk = confirm("Tem certeza que deseja remover essa linha?")

        if (isOk) {
            this.removeUser(username)
            this.updateView()
        }
    }
}