const tagName = 'ui-todos'
const template = document.createElement('template')
template.innerHTML = `
<style>
  div {
    align-items: center;
    display: flex;
    flex-direction: column;
    padding: 2rem 0;
    width: 100%;
  }
  h2 {
    animation: pop 1s ease-in-out;
    opacity: 0.5;
  }
  span {
    display: block;
    line-break: anywhere;
  }
  button {
    color: #fff;
    background-color: #007bff;
    border: none;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: .375rem .75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  }
  button:hover {
    background-color: #0062cc;
  }
  input {
    margin-right: 1rem;
  }
  input:checked ~ span {
    text-decoration: line-through !important;
  }
  .remove-btn {
    align-items: center;
    background-color: transparent !important;
    display: flex;
    padding: 0 0.5rem;
    position: absolute;
    top: 8px;
    right: 0;
  }
  .remove-btn:hover svg {
    fill: red;
  }
  .todo-item {
    background-color: whitesmoke;
    border-radius: 4px;
    flex-direction: row;
    margin: 0.2rem 0;
    padding: 0.5rem;
    position: relative;
    text-align: left;
  }
  .todo-item:nth-child(odd) {
    background-color: #e9ecef;
  }
  @keyframes pop {
    from { transform: scale(1); }
    50% { transform: scale(1.1); }
    to { transform: scale(1); }
  }
</style>
<div class="ui-todos">
  <h2>+ to create a new To-do</h2>
</div>
`

class UiTodos extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.list = this.shadowRoot.querySelector('div')
    this.addBtn = document.querySelector('.add-todo')
    this.hideBtn = document.querySelector('.hide-completed')
    this.search = document.querySelector('.search-text')


    this.todos = this._get()
    this.filters = {
      searchText: '',
      hideCompleted: false
    }
  }

  connectedCallback () {
    this._render()
    this.addBtn.addEventListener('submit', this._create.bind(this))
    this.hideBtn.addEventListener('change', (e) => {
      this.filters.hideCompleted = e.target.checked
      this._render()
    })
    this.search.addEventListener('keyup', (e) => {
      this.filters.searchText = e.target.value
      this._render()
    })
  }

  _get () {
    const todosJSON = localStorage.getItem('todos')
    if (todosJSON !== null) {
      return JSON.parse(todosJSON)
    } else {
      return []
    }
  }

  _set () {
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  _create (e) {
    e.preventDefault()
    this.todos.push({
      id: uuidv4(),
      text: e.target.elements.text.value,
      completed: false
    })
    this._set(this.todos)
    this._render(this.todos)
    e.target.elements.text.value = ''
  }

  _remove (id) {
    const index = this.todos.findIndex((todo) => {
      return todo.id === id
    })

    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }

  _toggle (id) {
    const todo = this.todos.find(function (todo) {
      return todo.id === id
    })

    if (todo !== undefined) {
      todo.completed = !todo.completed
    }
  }

  _render () {
    this.todos.length !== 0 ? this.list.querySelector('h2').style.display = 'none'
      : this.list.querySelector('h2').style.display = 'block'

    this._dump()

    this.todos.forEach(todo => {
      if (this.filters.hideCompleted && todo.completed) {
        return
      }

      if (this.filters.searchText !== '') {
        const filteredTodos = this.todos.filter((todo) => {
          const searchTextMatch = todo.text.toLowerCase().includes(this.filters.searchText.toLowerCase())
          const hideCompletedMatch = !this.filters.hideCompleted || !todo.completed

          this._dump()

          return searchTextMatch && hideCompletedMatch
        })

        filteredTodos.forEach((todo) => {
          this._createItem(todo)
        })
      } else {
        this._createItem(todo)
      }
    })
  }

  _createItem (todo) {
      const div = document.createElement('div')
      div.classList.add('todo-item')

      const checkbox = document.createElement('input')
      checkbox.setAttribute('type', 'checkbox')
      checkbox.checked = todo.completed
      checkbox.addEventListener('change', () => {
        this._toggle(todo.id)
        this._set()
        this._render()
      })

      const removeButton = document.createElement('button')
      removeButton.classList.add('remove-btn')
      removeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4 10.87L11.87 13 9 10.13 6.13 13 5 11.87 7.87 9 5 6.13 6.13 5 9 7.87 11.87 5 13 6.13 10.13 9 13 11.87z"/></svg>`

      removeButton.addEventListener('click', () => {
        this._remove(todo.id)
        this._set()
        this._render()
      })

      const span = document.createElement('span')
      span.textContent = todo.text

      div.append(checkbox)
      div.append(span)
      div.append(removeButton)

      this.list.appendChild(div)
  }

  _dump () {
    this.list.querySelectorAll('.todo-item').forEach(element => element.remove())
  }
}

customElements.define(tagName, UiTodos)
