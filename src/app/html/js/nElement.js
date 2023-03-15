
class nElement {
  container = document.createElement('div')
  element = document.createElement('div')

  options = {
    element: {
      tagName: 'div',
    },
    container: {
      tagName: 'div',
    },
    component: {
      name: 'component',
    }
  }

  constructor(options) {
    this.options = {
      ...this.options,
      ...options,
    }

    this.build()
  }

  build() {
    if (this.options.element.tagName) {
      this.element = document.createElement(this.options.element.tagName)
    }

    if (this.options.container.tagName) {
      this.container = document.createElement(this.options.container.tagName)
    }

    if (this.options.component.name) {
      this.element.classList.add(`el-${this.options.component.name}`)
      this.container.classList.add(`ct-${this.options.component.name}`)
    }

    this.setStyle('box-sizing', 'border-box')
    this.setStyle('font', 'inherit')
    this.setStyle('outline', 'none')
    this.setStyle('border', 'none')
    this.setStyle('padding', '0')
    this.setStyle('margin', '0')
  }

  static fromElement(el = document.createElement('')) {
    const component = new nElement()
    component.element = el
    return component
  }

  static fromId(id) {
    return nElement.fromElement(document.getElementById(id))
  }

  setContainerStyle(name, value) {
    this.container.style[name] = value
    return this
  }

  getContainerStyle(name) {
    return this.container.style[name]
  }

  setStyle(name, value) {
    this.element.style[name] = value
    return this
  }

  getStyle(name) {
    return this.element.style[name]
  }

  setAttr(name, value) {
    this.element.setAttribute(name, value)
    return this
  }

  getAttr(name) {
    return this.element.getAttribute(name)
  }

  setText(value) {
    this.element.innerText = value
    return this
  }

  getText() {
    return this.element.innerText
  }

  on(name, value) {
    this.element.addEventListener(name, value.bind(this))
    return this
  }

  once(name, value) {
    this.element.addEventListener(name, value.bind(this), { once: true })
    return this
  }

  setData(name, value) {
    this.element.dataset[name] = value
    return this
  }

  getData(name) {
    return this.element.dataset[name]
  }

  clear() {
    while (this.element.children.length > 0) {
      this.element.children.item(0).remove()
    }

    return this
  }

  append(nelement = new nElement()) {
    this.element.append(nelement.render())
    return this
  }

  render() {
    this.container.append(this.element)
    return this.container
  }
}

class nH1 extends nElement {
  constructor() {
    super({
      component: { name: 'h1' },
    })

    this.setStyle('font-weight', 'bold')
    this.setStyle('font-size', '3rem')
  }
}

class nText extends nElement {
  constructor() {
    super({
      element: { tagName: 'p' },
      component: { name: 'text' },
    })
  }
}

class nNumber extends nElement {
  num = 0

  constructor() {
    super({
      element: { tagName: 'p' },
      component: { name: 'number' },
    })

    this.setNumber(this.num)
  }

  setText() {
    throw new Error('Can not do this.')
  }

  setNumber(num) {
    this.num = num
    super.setText(this.num)
    return this
  }

  add(num = 1) {
    this.num += num
    super.setText(this.num)
    return this
  }

  sub(num = 1) {
    this.num -= num
    super.setText(this.num)
    return this
  }
}

class nButton extends nElement {
  constructor() {
    super({
      element: { tagName: 'button' },
      component: { name: 'button' },
    })

    this.setStyle('border', 'none')
    this.setStyle('outline', 'none')
    this.setStyle('padding', '1rem')
    this.setStyle('font-weight', 'bold')
  }
}

class nLink extends nElement {
  constructor() {
    super({
      element: { tagName: 'a' },
      component: { name: 'link' },
    })

    this.setStyle('text-decoration', 'none')
    this.setStyle('color', 'inherit')
  }

  href(href) {
    this.setAttr('href', href)
    return this
  }
}

class nImage extends nElement {
  constructor() {{
    super({
      element: { tagName: 'img' },
      component: { name: 'image' }
    })

    this.element.alt = 'image'

    this.setStyle('width', '100%')
  }}

  src(value = '') {
    this.element.src = value
    return this
  }
}

class nFlex extends nElement {
  constructor() {
    super({
      component: { name: 'flex' },
    })

    this.setStyle('display', 'flex')
    this.setStyle('justify-content', 'space-between')
  }
}

class nLabel extends nElement {
  constructor() {
    super({
      component: { name: 'label' },
    })

    this.setStyle('margin-bottom', '0.5rem')
    this.setStyle('padding-top', '0.5rem')
    this.setStyle('padding-botton', '0.5rem')
  }
}

class Valuable extends nElement {
  maxlength = undefined

  placeholder(value) {
    this.element.placeholder = value
    return this
  }

  setMaxLength(value) {
    this.element.maxlength = this.maxlength = value
    return this
  }

  getValue() {
    return this.element.value
  }

  setValue(value) {
    this.element.value = value
    return this
  }

  clear() {
    return this.setValue('')
  }

}

class nInputText extends Valuable {
  constructor() {
    super({
      component: { name: 'input-text' },
      element: { tagName: 'input' }
    })

    this.setAttr('type', 'text')

    this.setContainerStyle('display', 'inline-block')
    this.setContainerStyle('width', '100%')

    this.setStyle('font-size', 'inherit')
    this.setStyle('padding', '0.5rem')
    this.setStyle('width', '100%')
  }
}

class nInputNumber extends Valuable {
  constructor() {
    super({
      component: { name: 'input-number' },
      element: { tagName: 'input' }
    })

    this.setAttr('type', 'number')

    this.setStyle('padding', '0.5rem')
  }
}

class nInputDate extends nElement {
  flex = new nFlex

  day = new nInputNumber
  month = new nInputNumber
  year = new nInputNumber

  constructor() {
    super({
      component: { name: 'input-date' }
    })

    this.flex.append(this.makeInput(this.day))
    this.flex.append(this.makeSeparator('/'))
    this.flex.append(this.makeInput(this.month))
    this.flex.append(this.makeSeparator('/'))
    this.flex.append(this.makeInput(this.year))

    this.append(this.flex)
  }

  makeInput(input) {
    input.setStyle('width', '100%')
    return input
  }

  makeSeparator(text) {
    const sep = new nText()

    sep.setContainerStyle('width', '1rem')
    sep.setStyle('width', '1rem')

    sep.setStyle('text-align', 'center')
    sep.setStyle('padding-top', '0.5rem')
    sep.setStyle('padding-botton', '0.5rem')

    sep.setText(text)

    return sep
  }

  getValue() {
    return [
      this.day.getValue(),
      this.month.getValue(),
      this.year.getValue(),
    ].map((value) => value.toString()).join(' ')
  }

  setValue(value = '') {
    const [day, month, year] = value.split(' ')
    this.day.setValue(day)
    this.month.setValue(month)
    this.year.setValue(year)
    return this
  }
}

class nInputTime extends nElement {
  flex = new nFlex

  hour = new nInputNumber
  minutes = new nInputNumber

  constructor() {
    super({
      component: { name: 'input-time' }
    })

    this.flex.append(this.makeInput(this.hour))

    const sep = new nElement()
    sep.setText(':')

    sep.setContainerStyle('width', '1rem')

    sep.setStyle('padding-botton', '0.5rem')
    sep.setStyle('padding-top', '0.5rem')
    sep.setStyle('text-align', 'center')
    sep.setStyle('width', '1rem')
    this.flex.append(sep)

    this.flex.append(this.makeInput(this.minutes))

    this.append(this.flex)
  }

  makeInput(input) {
    input.setStyle('width', '100%')
    return input
  }

  getValue() {
    return [
      this.hour.getValue(),
      this.minutes.getValue(),
    ].map((str) => str.toString()).join(' ')
  }

  setValue(value = '') {
    const [hour, minutes] = value.split(' ')
    this.hour.setValue(hour)
    this.minutes.setValue(minutes)
    return this
  }
}

class nError extends nElement {
  constructor() {
    super({
      component: { name: 'error' },
    })

    this.setStyle('color', 'red')
    this.setStyle('padding-top', '0.5rem')
    this.setStyle('padding-botton', '0.5rem')
  }
}

class nCenter extends nElement {
  constructor() {
    super({ component: { name: 'center' } })

    this.setStyle('margin', '0 auto')
    this.setStyle('width', '42rem')
  }
}
