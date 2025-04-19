import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import Home from '@/views/Home.vue'
import Auth from '@/views/authentication/Auth.vue'
import ConfirmAccount from '@/views/authentication/ConfirmAccount.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: Auth,
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/components/authentication/LoginForm.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/components/authentication/RegisterForm.vue')
        }
      ]
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: ConfirmAccount,
      meta: { guest: true }
    },
    {
      path: '/password',
      component: () => import('@/views/authentication/Password.vue'),
      meta: { guest: true },
      children: [
        {
          path: 'forgot',
          name: 'password.forgot',
          component: () => import('@/components/authentication/PasswordForgot.vue')
        },
        {
          path: 'reset',
          name: 'password.reset',
          component: () => import('@/components/authentication/PasswordReset.vue')
        }
      ]
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/auth'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isAuthenticated']) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (store.getters['auth/isAuthenticated']) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router