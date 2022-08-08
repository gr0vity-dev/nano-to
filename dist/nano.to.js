new Vue({
    el: '#app',
    data: {
      doc_title: 'Nano.to - Nano Username & Checkout UI',
      title: 'Nano.to',
      convert: NanocurrencyWeb.tools.convert,
      error: false,
      status: '',
      tab: 'docs',
      user: false,
      loading: true,
      background: false,
      rate: false,
      params: {},
      prompt: false,
      search: true,
      string: '',
      color: 'blue',
      usernames: [],
      notification: false,
      checkout: false,
      suggestions: [],
      colors: [],
      buttons: [{
        text: `[]`,
        link: `https://nano.to/${1}`,
        target: '_blank'
      }, {
        text: `[view account]`,
        link: `https://nano.to/${1}/about`,
        target: '_self'
      }, ],
      status: true,
    },
    computed: {
      amount() {
        var query = this.queryToObject()
        if (query.random || query.r) {
          var str = `${this.getRandomArbitrary(1, 9).toFixed(0)}${this.getRandomArbitrary(1, 9).toFixed(0)}${this.getRandomArbitrary(1, 9).toFixed(0)}${this.getRandomArbitrary(1, 9).toFixed(0)}`
          return (Number(this.checkout.amount) + Number(`0.00${str}`)).toFixed(6)
        }
        return this.checkout.amount
      },
      value() {
        var val = this.checkout && this.checkout.amount ? this.checkout.amount : 0
        if (this.checkout.currency === 'USD') return (this.checkout.currency || '$ ') + val
        if (!this.checkout.currency || this.checkout.currency === 'NANO') return (this.checkout.currency || 'Ӿ ') + `${this.checkout.amount && Number(this.checkout.amount) < 1 ? Number(this.checkout.amount).toFixed(3) : Math.floor(this.checkout.amount)} NANO`
      }
    },
    watch: {
      string() {
        this.query()
      },
      admin() {
        this.background = !this.background
      }
    },
    mounted() {

      if (navigator.standalone || (screen.height - document.documentElement.clientHeight < 40)) {
        if (document.body) document.body.classList.add('fullscreen');
      }

      this.load((data) => {
        if (window.location.pathname !== '/') {
          this._checkout(null, data)
        }
        setTimeout(() => {
          this.loading = false
        }, 105)
      })

    },
    methods: {
      lease(name) {
        // console.log(name)
        axios.get(`https://name.nano.to/lease/${name}`).then((res) => {
          this._checkout(res.data, null)
          // document.title = `${name} - New Lease`
          // console.log( res.data )
          // if (res.data.error) {
          //   this.reset()
          //   return this.notify(`Error 26: Expired Checkout.`, 'error', 10000)
          // }
        }).catch(e => {
          // this.reset()
          // this.notify(e.message ? e.message : 'Error 27', 'error', 10000)
        })
      },
      invoice() {
        var query = this.queryToObject()
        var path = window.location.pathname.replace('/', '').toLowerCase().replace('@', '')
        var configured = query.project || query.server || query.endpoint || query.url || query.api || false
        var endpoint = configured || `https://api.nano.to/checkout/${path.replace('pay_', '')}`
        axios.get(endpoint).then((res) => {
          if (res.data.error) {
            this.reset()
            return this.notify(`Error 26: Expired Checkout.`, 'error', 10000)
          }
        }).catch(e => {
          this.reset()
          this.notify(e.message ? e.message : 'Error 27', 'error', 10000)
        })
      },
      _checkout(item, data) {
        this.getRate()
        var path = window.location.pathname.replace('/', '').toLowerCase().replace('@', '')
        var item = item || data.find(a => a.name.toLowerCase() === path)
        var checkout = path.includes('pay_') || path.includes('invoice_') || path.includes('id_')
        if (path && checkout) {
          document.title = `${path.includes('invoice_') ? 'Invoice ' : ''}#${path.replace('pay', '').replace('invoice_', '').replace('id_', '').slice(0, 8)} - Nano Checkout`
          return this.invoice()
        }
        if (item) {
          var query = this.queryToObject()
          var custom = true
          var plans = item.plans || query.p || query.plans
          var vanity = item.vanity || query.vanity
          var highlight = query.button || query.backdrop || query.border || query.backgrounds || query.highlight
          if (plans) custom = false
          var amount = query.price || query.amount || query.n || query.x || query.cost || false
          if (!amount && !plans) plans = `Tip:${this.getRandomArbitrary(0.1, 0.9).toFixed(2)},Small:5,Medium:10,Large:25`
          var success = query.success ||query.success_url
          if (plans && typeof plans === 'string') {
            plans = plans.split(',').map(a => {
              return { title: a.trim().split(':')[0], value: a.trim().split(':')[1] } 
            })
          }
          this.checkout = {
            title: item.title || query.name || query.title || (item.name ? ('@' + item.name) : 'Pay with NANO'),
            currency: query.currency || query.c,
            message: query.body || query.message || query.text || query.copy,
            fullscreen: true,
            image: query.image || query.img || query.i || '',
            address: query.address || query.to || item.address,
            amount,
            plans,
            color: {
              // vanity: vanity,
              vanity:  query.vanity ? query.vanity.split(':')[0].replace('$', '#') : '',
              text:  query.color ? query.color.split(':')[0].replace('$', '#') : '',
              primary: query.color ? query.color.split(':')[0].replace('$', '#') : '',
              highlight_background: highlight && highlight.split(':')[0] ? highlight.split(':')[0].replace('$', '#') : '',
              highlight_color: highlight && highlight.split(':')[1] ? highlight.split(':')[1].replace('$', '#') : '',
              highlight_address: highlight && highlight.split(':')[2] ? highlight.split(':')[2].replace('$', '#') : '',
              left: query.left || query.background && query.background.split(':')[0] ? query.background.split(':')[0].replace('$', '#') : '#FFF', 
              right: query.right || query.background && query.background.split(':')[1] ? query.background.split(':')[1].replace('$', '#') : '#009dff', 
              qrcode: {
                logo: query.logo ? query.logo : '',
                light: query.qrcode && query.qrcode.split(':')[0] ? query.qrcode.split(':')[0].replace('$', '#') : '',
                dark: query.qrcode && query.qrcode.split(':')[1] ? query.qrcode.split(':')[1].replace('$', '#') : '',
              },
              // button: {
              //   text: query.color.split(':')[1].replace('$', '#') : '',
              //   background: query.color.split(':')[0].replace('$', '#') : '',
              // }
              address: {
                hightlight: query.color,
              }
            },
            success, 
            cancel: query.cancel || query.cancel_url || query.c, 
          }
          setTimeout(() => {
            this.showQR()
            if (this.checkout && this.checkout.plans && this.checkout.plans[0]) {
              this.checkout.amount = this.checkout.plans[0].value
            }
          }, 100)
          document.title = `@${item.name} - Nano Checkout`
        }
        if (path && path.includes('nano_')) {
          if (!NanocurrencyWeb.tools.validateAddress(path)) return alert('Invalid Address')
          var query = this.queryToObject()
          
          var plans = query.p

          var amount = query.price || query.amount || query.n || query.x || query.cost
              amount = amount ? amount.match( /\d+/g ).join('') : false

          var success = item.success || query.success ||query.success_url || query.redirect || query.r

          // var amount = query.price || query.amount || query.n || query.x || query.cost || false
          if (!amount && !plans) plans = `Tip:${this.getRandomArbitrary(0.1, 0.9).toFixed(2)},Small:5,Medium:10,Large:25`
          // var success = query.success || query.success_url
          // if (plans && !plans.includes(':')) amount = plans
          // if (plans && plans.includes(':')) {
          //   plans = plans.split(',').map(a => {
          //     return { title: a.trim().split(':')[0], value: a.trim().split(':')[1] } 
          //   })
          // }

          if (plans) {
            plans = plans.split(',').map(a => {
              return { title: a.trim().split(':')[0], value: a.trim().split(':')[1] } 
            })
          }
          this.checkout = {
            currency: query.currency || query.c,
            message: query.body || query.message || query.text || query.copy,
            fullscreen: true,
            image: query.image || query.img || query.i || '',
            address: query.address || query.to || path,
            amount,
            plans,
            title: query.name || query.title || 'Pay with NANO',
            color: {
              right: query.rightBackground || '#009dff', 
              address: {
                hightlight: query.hightlight,
              }
            },
            success, 
            cancel: query.cancel || query.cancel_url || query.c, 
          }
          setTimeout(() => {
            this.showQR()
            if (this.checkout && this.checkout.plans && this.checkout.plans[0]) {
              this.checkout.amount = this.checkout.plans[0].value
            }
          }, 100)
          document.title = `Pay ${path.slice(0, 12)} - Nano Checkout`
        }
      },
      getRandomArbitrary(min, max) {
          return Math.random() * (max - min) + min
      },
      cancel() {
        if (this.checkout.cancel && this.checkout.cancel.includes('.')) return window.location.href = this.checkout.cancel
        this.checkout = false
      },
      planValue(plan) {
        if (this.checkout.currency === 'USD') {
          var value = Math.floor(this.rate * plan.value)
          return `$${value}`
        }
        return `${plan.value && Number(plan.value) < 1 ? Number(plan.value).toFixed(3) : Math.floor(plan.value)} NANO`
      },
      clickPlan(plan) {
        // if (!plan.value) return
        // if (this.checkout.currency !== 'USD') {
          // var value = plan.value
        this.checkout.amount = Number(plan.value)
        // }
        // document.getElementById("qrcode").innerHTML = "";
        this.showQR()
        // console.log("plan.value", )
        // console.log("this.checkout.amount", )
        this.$forceUpdate()
      },
      toggleCurrency() {
        var currency = this.queryToObject().currency
        this.$forceUpdate()
      },
      redirect(block, url) {
        window.location.href = url || this.checkout.success ? this.checkout.success.replace('{{block}}', block.hash).replace('{{hash}}', block.hash).replace('{{ hash }}', block.hash).replace('{{HASH}}', block.hash).replace('{{ HASH }}', block.hash).replace(':hash', block.hash) : '/'
      },
      success(block) {
        this.status = 'good'
        this.notify('Success')
        if (this.checkout.post_url) {
          axios.post(this.checkout.post_url, { block: block }).then((res) => {
            resolve( this.redirect(block, res.data.redirect_url) )
          })
          return 
        }
        if (this.checkout.success) this.redirect(block)
       },
       pending() {
         return new Promise((resolve) => {
          var endpoint = 'https://nanolooker.com/api/rpc'
          axios.post(endpoint, { 
            action: 'pending', 
            account: this.checkout.address,
            count: "25",
            json_block: true,
            source: true,
          }).then((res) => {
            resolve(res.data.blocks == "" ? [] : Object.keys(res.data.blocks).map(key => {
              return { address: res.data.blocks[key].source, amount: res.data.blocks[key].amount }
            }))
          })
        })
       },
       history() {
        return new Promise((resolve) => {
          var endpoint = 'https://nanolooker.com/api/rpc'
          axios.post(endpoint, { 
            action: 'account_history', 
            account: this.checkout.address,
            count: "25",
            raw: true
          }).then((res) => {
            resolve(res.data)
            // console.log(res)
          })
        })
       },
       check() {
        try {
          return this.pending().then((_pending) => {
            // console.log( _pending )
            var in_pending = _pending.find(a => {
              console.log( NanocurrencyWeb.tools.convert )
              // console.log( this.convert(a.amount, 'NANO', 'RAW'), this.checkout.amount, String(this.convert(a.amount, 'NANO', 'RAW')) === String(this.checkout.amount)  )
              // console.log(  "100353000000000000000000000000" )
              return String(this.convert(a.amount, 'NANO', 'RAW')) === String(this.checkout.amount)
            })
            if (in_pending) return this.success(in_pending)
            if (!in_pending) {
              this.history().then((_history) => {
                var in_history = _history.history.find(a => String(this.convert(a.amount, 'NANO', 'RAW')) === String(this.checkout.amount))
                if (in_history) return this.success(in_history)
                if (!in_history) {
                  // this.status = 'warn'
                  this.notify('Payment not found', 'warn')
                }
              })
            }
            // console.log( in_pending )
          })
        } catch(e) {
          this.notify(e.message ? e.message : 'Error Occured')
        }
       },
       queryToObject(string) {
        var pairs = (string || window.location.search).substring(1).split("&"),
          obj = {},
          pair,
          i;
        for ( i in pairs ) {
          if ( pairs[i] === "" ) continue;
          pair = pairs[i].split("=");
          obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
        }
        return obj;
      },
      notify(text, type, timeout){
        this.notification = text
        if (type) this.status = type
        setTimeout(() => {
          this.status = ''
          this.notification = false
        }, timeout || 2000)
      },
      capitalizeFirstLetter(string) {
        if (!string || !string.charAt(0)) return
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      getRate(cb) {
        var query = this.queryToObject()
        var currency = query.currency ? query.currency.toLowerCase() : 'usd'
        return axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=${currency}`).then((res) => {
          if (res.data.nano && res.data.nano[currency]) this.rate = res.data.nano[currency]
          if (cb) cb(res.data)
        })
      },
      load(cb) {
        return axios.get('https://raw.githubusercontent.com/fwd/nano/master/known.json').then((res) => {
          this.usernames = res.data
          if (cb) cb(res.data)
        })
      },
      invalidUsername(name) {
        return !name || name.length > 60 || name.includes('_') || name.includes('nano_') || name.includes('xrb_') || !(/^\w+$/.test(name)) || name.includes('%5C')
      },
      isMatch(item, string) {
        // console.log(item, string)
        // if (item.address.toLowerCase() == string.toLowerCase()) return true
        if (item.name.toLowerCase().includes(string.toLowerCase())) return true
        return false
        // return item.name.toLowerCase().includes(string.toLowerCase())
      },
      query() {
        var string = this.string ? this.string.toLowerCase() : this.string
        if (!string) return
        if ((string.includes('nano_') || string.includes('xrb_')) && NanocurrencyWeb.tools.validateAddress(string)) {
          return this.suggestions = [
            {
              name: `Checkout (${string.slice(0, 12)})`,
              checkout: {
                address: string,
                amount: false,
              }
            },
            {
              name: `Nanolooker (${string.slice(0, 12)})`,
              url: `https://nanolooker.com/account/${string}`
            }
          ]
        }
        if (!string.includes('nano_') && this.invalidUsername(string)) {
          return this.suggestions = [{
            name: 'Invalid Search',
            error: true
          }]
        }
        var item = this.usernames.find(a => this.isMatch(a, string))
        if (!item && !this.invalidUsername(string)) {
          return this.suggestions = [{
            name: "Username Available",
            lease: string,
            // color: 'green',
            // alert: 'Registration in Maintenance',
          }]
        }
        if (!item) return this.suggestions = [{
          name: 'Invalid Search',
          error: true
        }]
        this.suggestions = this.usernames.filter(a => a.name.toLowerCase().includes(string.toLowerCase())).reverse()
      },
      async shareText(text) {
        var self = this
        // alert("yoo")
        try {
          await navigator.share({
            // title: 'MDN',
            text
            // url: 'https://developer.mozilla.org'
          })
          window.alert('API Key copied to clipboard.')
          // resultPara.textContent = 'MDN shared successfully'
        } catch (err) {
          window.alert('Could not copy.')
          // resultPara.textContent = 'Error: ' + err
          // self.$notify('Error sharing.')
        }
      },
      copy(text) {
        var self = this
        navigator.clipboard.writeText(text).then(function() {
          self.notify('Copied to clipboard.')
        }, function() {
          document.execCommand("copy");
        })
      },
      showQR(string) {
        document.getElementById("qrcode").innerHTML = "";
        setTimeout(() => {
          var options = {
            text: string || `nano:${this.checkout.address}${this.checkout.amount ? '?amount=' + this.convert(this.amount, 'NANO', 'RAW') : ''}`,
            width: 300,
            height: 280,
            logo: "dist/images/logo.png",
            // logoBackgroundColor: 'red'
          }
          if (this.checkout && this.checkout.color && this.checkout.color.qrcode && this.checkout.color.qrcode.dark) options.colorDark = this.checkout.color.qrcode.dark
          if (this.checkout && this.checkout.color && this.checkout.color.qrcode && this.checkout.color.qrcode.light) options.colorLight = this.checkout.color.qrcode.light
          if (this.checkout && this.checkout.color && this.checkout.color.qrcode && this.checkout.color.qrcode.logo) options.logo = this.checkout.color.qrcode.logo
          if (this.checkout && this.checkout.color && this.checkout.color.qrcode && this.checkout.color.qrcode.transparent) options.backgroundImageAlpha = this.checkout.color.qrcode.transparent
          new QRCode(document.getElementById("qrcode"), options);
          this.$forceUpdate()
        }, 100)
      },
      doButton(button) {
        if (button.checkout) {
          this._checkout(button.checkout, null)
          return 
        }
        if (button.link === "qrcode") {
          this.prompt.showQR = true
          this.$forceUpdate()
        }
        if (button.link === "external") {
          window.open(button.url || button.checkout, '_blank').focus();
        }
      },
      reset() {
        this.title = 'Nano.to'
        this.string = ''
        this.search = true
        this.status = ''
        this.color = 'blue'
        this.suggestions = []
        history.pushState({}, null, '/');
        document.title = this.doc_title
      },
      doSuggestion(suggestion) {
        // console.log("suggestion", suggestion)
        if (suggestion.lease) return this.lease(suggestion.lease)
        if (suggestion.url) return window.open(suggestion.url, '_blank');
        if (suggestion.checkout) return this._checkout(suggestion.checkout, null)
        if (!suggestion.address) return
        if (suggestion.error) return this.reset()
        var self = this
        self.search = false
        var checkout = {
          name: suggestion.name,
          address: suggestion.address,
          amount: false,
        }
        self.prompt = {
          title: `${suggestion.name}`,
          qrcode: `nano:${suggestion.address}`,
          body: `
<p style="font-size: 26px; text-transform: lowercase; word-break: break-word; max-width: 430px; text-align: center; width: 100%; display: inline-block; margin-top: 0px; margin-bottom: 0px; text-shadow: rgb(49, 49, 49) 2px 2px 0px;">
<span style="color: rgb(253, 0, 7);">${suggestion.address.slice(0, 12)}</span>${suggestion.address.slice(12, 58)}<span style="color: rgb(253, 0, 7);">${suggestion.address.slice(59, 99)}</span>
</p>`,
          buttons: [{
            label: `Send Payment`,
            link: "external",
            checkout: checkout,
            // url: `https://nano.to/${suggestion.address}?title=@${suggestion.name}&cancel=https://nano.to/${suggestion.name}/about`
          }, {
            label: 'Open Natrium',
            link: "external",
            url: `nano:${suggestion.address}`
          }, ]
        }
        history.pushState({}, null, '/' + suggestion.name);
        self.$forceUpdate()
      },
      stringToColour(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
      },
    }
})