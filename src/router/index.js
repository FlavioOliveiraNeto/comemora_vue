import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

import Home from '@/views/Home.vue'

import Auth from '@/views/authentication/Auth.vue'
import EmailConfirm from '../components/authentication/EmailConfirm.vue'

import EventNew from '@/views/events/EventNew.vue'
import EventEdit from '@/views/events/EventEdit.vue'
import EventShow from '@/views/events/EventShow.vue'
import EventJoin from '@/views/events/EventJoin.vue'
import EventAlbum from "@/components/events/EventAlbum.vue"

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
      path: '/confirmar-email',
      name: 'confirmar-email',
      component: EmailConfirm,
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
      path: '/events/new',
      name: 'EventNew',
      component: EventNew,
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id',
      name: 'EventShow',
      component: EventShow,
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id/edit',
      name: 'EventEdit',
      component: EventEdit,
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id/join',
      name: 'EventJoin',
      component: EventJoin,
      meta: { requiresAuth: false }
    },
    {
      path: '/events/:id/album',
      name: 'EventAlbum',
      component: EventAlbum,
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
      next({ name: 'login' }) // Redireciona para o login se não estiver autenticado
    } else {
      next() // Permite o acesso à rota
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
