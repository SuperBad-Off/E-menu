import firebase from 'firebase/app'
import localizeFilter from '@/filters/localize.filter'

export default {
  actions: {
    async login ({ commit, dispatch, getters }, { email, password }) { // логин
      try {
        if (getters.getOrderData.table != null) {
          await firebase.auth().signInWithEmailAndPassword(email, password)
          await dispatch('fetchInfo') // получить инфу о профиле
          await dispatch('createInfo_Order') // создать инфу о заказе
          commit('setMess', localizeFilter('Logged'))
        } else { throw new Error(localizeFilter('no_table')) }
      } catch (e) {
        commit('setMess', e)
        throw e
      }
    },
    async register ({ dispatch, commit, getters }, { email, password, name }) { // регистрация
      try {
        if (getters.getOrderData.table != null) {
          await firebase.auth().createUserWithEmailAndPassword(email, password)
          const uid = await dispatch('getUid')
          await firebase.database().ref(`/users/${uid}/info`).set({
            name,
            email,
            age: 0,
            bonus: 0,
            locale: 'ru-RU',
            title: 'Русский'
          })
          await dispatch('fetchInfo') // получить инфу о профиле
          // await dispatch('updatefetchInfo_Order') // обновить инфу о заказе
          commit('setMess', localizeFilter('registered'))
        } else { throw new Error(localizeFilter('no_table')) }
      } catch (e) {
        commit('setMess', e)
        throw e
      }
    },
    async guest ({ dispatch, commit, getters }) { // логин анонимно, гость
      try {
        if (getters.getOrderData.table != null) {
          await firebase.auth().signInAnonymously()
          const uid = await dispatch('getUid')
          await firebase.database().ref(`/users/${uid}/info`).set({
            name: 'Guest',
            email: 'ImGuest',
            age: 0,
            bonus: 0,
            locale: 'ru-RU',
            title: 'Русский'
          })
          await dispatch('fetchInfo') // получить инфу о профиле
          await dispatch('createInfo_Order') // создать инфу о заказе
          commit('setMess', localizeFilter('LoggedGuest'))
        } else { throw new Error(localizeFilter('no_table')) }
      } catch (e) {
        commit('setMess', e)
        throw e
      }
    },
    getUid () { // получаем ид пользователя
      const user = firebase.auth().currentUser
      return user ? user.uid : null
    },
    async logout ({ commit }) { // логаут
      await firebase.auth().signOut()
      commit('clearInfo')
      commit('setMess', localizeFilter('LoggedOut'))
    },
    async changePassword ({ commit }) { // отправляем запрос на смену пароля
      var auth = firebase.auth()
      var emailAddress = firebase.auth().currentUser.email

      auth.sendPasswordResetEmail(emailAddress).then(function () {
        commit('setMess', localizeFilter('password_change_email'))
      }).catch(function (error) {
        commit('setMess', error)
      })
    }
  }
}
