import './components/ui-todos.js'

const btn = document.querySelector('.to-top')

function showButton () {
  return window.scrollY > 100 ? btn.style.opacity = '1' : btn.style.opacity = '0'
}

window.addEventListener('scroll', showButton)
btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }) })
