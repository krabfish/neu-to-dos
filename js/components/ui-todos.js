const tagName = 'ui-todos'
const template = document.createElement('template')
template.innerHTML = `
<style>
  div {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 0;
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
    background-color: #333333;
    border-radius: 25px;
    color: #FFFFFF;
    margin-left: 1rem;
    padding: 1px 8px;
  }
  .remove-btn:hover {
    background-color: red;
  }
  .todo-item {
    border: 1px solid #333333;
    border-radius: 4px;
    flex-direction: row;
    margin: 0.5rem;
    padding: 0.5rem;
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
    this.addBtn = document.getElementById('add-todo')
    this.hideBtn = document.querySelector('.hide-completed')
    this.search = document.querySelector('#search-text')


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

  // Toggle the completed value for a given todo
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
      checkbox.addEventListener('change', (e) => {
        this._toggle(todo.id)
        this._set()
        this._render()
      })

      const removeButton = document.createElement('button')
      removeButton.classList.add('remove-btn')
      removeButton.innerHTML = '&times;'
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
