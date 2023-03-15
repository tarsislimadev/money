
class Response {
  status = null
  message = null
  data = {}

  getData() {
    return this.data || {}
  }

  get(name, other = '') {
    return this.getData()[name] || other
  }

  getMessage() {
    return this.message || null
  }

  getStatus() {
    return this.status
  }

  toString() {
    const { status, message, data } = this
    return JSON.stringify({ status, message, data })
  }
}

class SuccessResponse extends Response {
  constructor({ responseText }) {
    super()

    const { status, message, data } = JSON.parse(responseText)

    this.status = status
    this.message = message
    this.data = data
  }
}

class ErrorResponse extends Response {
  constructor(type, { responseText }) {
    super()

    this.type = type

    const { status, message, data } = JSON.parse(responseText)

    this.status = status
    this.message = message
    this.data = data
  }
}

const Local = function (id = '') {
  const self = this

  self.id = id

  self.named = (paths = []) => [self.id, ...paths].join('.')

  self.get = function (paths = [], def = null) {
    return new Promise((resolve) => {
      try {
        const data = JSON.parse(localStorage.getItem(self.named(paths)))
        const responseText = JSON.stringify({ status: 'ok', message: null, data })

        resolve(new SuccessResponse({ responseText }))
      } catch (e) {
        console.error(e)
        resolve(def)
      }
    })
  }

  self.set = function (paths = [], data = {}) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(self.named(paths), JSON.stringify(data))
        const responseText = JSON.stringify({ status: 'ok', message: null, data: {} })

        resolve(new SuccessResponse({ responseText }))
      } catch (e) {
        reject(e)
      }
    })
  }

  self.add = function (paths = [], data = {}) {
    const self = this

    return new Promise((resolve, reject) => {
      self.get(paths)
        .then((res) => {
          const list = res.get('list', [])

          list.push(data)

          self.set(paths, { list })

          const responseText = JSON.stringify({ status: 'ok', message: null, data: {} })
          resolve(new SuccessResponse({ responseText }))
        })
        .catch((err) => reject(err))
    })
  }
}

const Session = function (id = '') {
  const self = this

  self.id = id

  self.named = (paths = []) => [self.id, ...paths].join('.')

  self.get = function (paths = [], def = null) {
    return new Promise((resolve) => {
      try {
        const data = JSON.parse(sessionStorage.getItem(self.named(paths)))
        const responseText = JSON.stringify({ status: 'ok', message: null, data })

        resolve(new SuccessResponse({ responseText }))
      } catch (e) {
        console.error(e)
        resolve(def)
      }
    })
  }

  self.set = function (paths = [], data = {}) {
    return new Promise((resolve, reject) => {
      try {
        sessionStorage.setItem(self.named(paths), JSON.stringify(data))
        const responseText = JSON.stringify({ status: 'ok', message: null, data: {} })

        resolve(new SuccessResponse({ responseText }))
      } catch (e) {
        reject(e)
      }
    })
  }

  self.add = function (paths = [], data = {}) {
    const self = this

    return new Promise((resolve, reject) => {
      self.get(paths)
        .then((res) => {
          const list = res.get('list', [])

          list.push(data)

          self.set(paths, { list })

          const responseText = JSON.stringify({ status: 'ok', message: null, data: {} })
          resolve(new SuccessResponse({ responseText }))
        })
        .catch((err) => reject(err))
    })
  }
}

class Flow {
  static local = new Local('flow')

  static goTo(name, value = {}) {
    Flow.local.set(name, value)

      ;;

    (window.location = name)
  }
}

// //
// // //
// //
// // //

const l = new Local('api')

const Ajax = {
  BASE_URL: 'http://0.0.0.0/api/v1',
  post: (paths = [], data = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', [Ajax.BASE_URL, ...paths].join('/'), true)
      xhr.setRequestHeader('Content-Type', 'application/json')

      const onComplete = (xhr) => (xhr.status == '200')
        ? resolve(new SuccessResponse(xhr))
        : reject(new ErrorResponse('network', xhr))

      xhr.onload = () => onComplete(xhr)
      xhr.onerror = () => onComplete(xhr)

      xhr.send(JSON.stringify(data))
    })
  }
}

const Validator = ({
  rules: {
    required: (value, errorMessage = 'Required field.') => {
      return value ? null : errorMessage
    },
  },

  errorrer: function () {
    const self = this

    self.errors = {}

    self.add = function (name) {
      self.errors[name] = []
      return self
    }

    self.setError = function (name, message) {
      if (message) {
        self.errors[name].push(message)
      }

      return self
    }

    self.toString = function () {
      return JSON.stringify(self.errors)
    }

    self.toError = function () {
      return new ErrorResponse('validation', {
        responseText: JSON.stringify({
          status: 'error',
          message: 'validation error',
          data: self.errors,
        })
      })
    }

    self.hasErrors = () => Object.keys(self.errors)
      .reduce((has, errorName) => has || self.errors[errorName].length > 0, false)
  },

  with: (fields = {}) => {
    return {
      validate: (rules = {}) => {
        return new Promise((resolve, reject) => {
          const errors = new Validator.errorrer()

          Object.keys(rules)
            .map((ruleName) => {
              const name = ruleName
              const value = fields[ruleName]
              const ruleArr = rules[ruleName]

              errors.add(name)

              ruleArr.map((rule) => {
                const ruleFn = Validator.rules[rule]
                const errorMessage = ruleFn(value)

                if (errorMessage) errors.setError(name, errorMessage)
              })
            })

          errors.hasErrors()
            ? reject(errors.toError())
            : resolve({})
        })
      }
    }
  }
})

const API = {}

API.accountsLogin = ({ key, sso }) =>
  Validator.with({ key }).validate({
    key: ['required'],
  })
    .then(() => Ajax.post(['accounts', 'login'], { key, sso }))

API.productsList = () =>
  Ajax.post(['products', 'list'])

API.productsSearch = ({ search }) =>
  Ajax.post(['products', 'list'], { search })
    .then((res) => {
      return new SuccessResponse({
        responseText: JSON.stringify({
          status: 'ok',
          message: null,
          data: {
            list: res.get('list')
              .filter((item) => item.name.indexOf(search) != -1)
          }
        })
      })
    })

API.productsCreate = ({ name, lang, git }) =>
  Validator.with({ key }).validate({
    name: ['required'],
    lang: ['required'],
    git: ['required'],
  })
    .then(() => Ajax.post(['products', 'create'], { name, lang, git }))
