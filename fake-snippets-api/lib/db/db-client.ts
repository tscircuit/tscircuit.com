import { createStore, type StoreApi } from "zustand/vanilla"
import { immer } from "zustand/middleware/immer"
import { hoist, type HoistedStoreApi } from "zustand-hoist"
import { z } from "zod"

import {
  databaseSchema,
  Snippet,
  Session,
  LoginPage,
  Account,
  type DatabaseSchema,
  snippetSchema,
  Order,
  OrderFile,
} from "./schema.ts"
import { combine } from "zustand/middleware"
import { seed as seedFn } from "./seed"

export const createDatabase = ({ seed }: { seed?: boolean } = {}) => {
  const db = hoist(createStore(initializer))
  if (seed) {
    seedFn(db)
  }
  return db
}

export type DbClient = ReturnType<typeof createDatabase>

const initializer = combine(databaseSchema.parse({}), (set, get) => ({
  addOrder: (order: Omit<Order, "order_id">): Order => {
    let newOrder = { order_id: `order_${get().idCounter + 1}`, ...order }
    set((state) => {
      return {
        orders: [...state.orders, newOrder],
        idCounter: state.idCounter + 1,
      }
    })
    return newOrder
  },
  getOrderById: (orderId: string): Order | undefined => {
    const state = get()
    return state.orders.find((order) => order.order_id === orderId)
  },
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.order_id === orderId ? { ...order, ...updates } : order,
      ),
    }))
  },
  addOrderFile: (orderFile: Omit<OrderFile, "order_file_id">): OrderFile => {
    const newOrderFile = {
      order_file_id: `order_file_${get().idCounter + 1}`,
      ...orderFile,
    }
    set((state) => {
      return {
        orderFiles: [...state.orderFiles, newOrderFile],
        idCounter: state.idCounter + 1,
      }
    })
    return newOrderFile
  },
  getOrderFileById: (orderFileId: string): OrderFile | undefined => {
    const state = get()
    return state.orderFiles.find((file) => file.order_file_id === orderFileId)
  },
  addAccount: (account: Omit<Account, "account_id">) => {
    set((state) => {
      const newAccountId = `account_${state.idCounter + 1}`
      return {
        accounts: [...state.accounts, { account_id: newAccountId, ...account }],
        idCounter: state.idCounter + 1,
      }
    })
  },
  addSnippet: (snippet: Omit<z.input<typeof snippetSchema>, "snippet_id">) => {
    let newSnippet
    set((state) => {
      const newSnippetId = `snippet_${state.idCounter + 1}`
      newSnippet = snippetSchema.parse({ ...snippet, snippet_id: newSnippetId })
      return {
        snippets: [...state.snippets, newSnippet],
        idCounter: state.idCounter + 1,
      }
    })
    return newSnippet
  },
  getNewestSnippets: (limit: number): Snippet[] => {
    const state = get()
    return [...state.snippets]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit)
  },
  getSnippetsByAuthor: (authorName?: string): Snippet[] => {
    const state = get()
    if (authorName) {
      return state.snippets.filter(
        (snippet) => snippet.owner_name === authorName,
      )
    }
    return state.snippets
  },
  updateSnippet: (
    snippet_id: string,
    code: string,
    updated_at: string,
    options?: {
      is_board?: boolean
      is_package?: boolean
      is_model?: boolean
      is_footprint?: boolean
      snippet_name?: string
    },
  ) => {
    set((state) => {
      const snippetIndex = state.snippets.findIndex(
        (snippet) => snippet.snippet_id === snippet_id,
      )
      if (snippetIndex === -1) {
        return state
      }
      const updatedSnippets = [...state.snippets]
      updatedSnippets[snippetIndex] = {
        ...updatedSnippets[snippetIndex],
        code: code,
        updated_at: updated_at,
        ...(options?.is_board !== undefined && { is_board: options.is_board }),
        ...(options?.is_package !== undefined && {
          is_package: options.is_package,
        }),
        ...(options?.is_model !== undefined && {
          is_model: options.is_model,
        }),
        ...(options?.is_footprint !== undefined && {
          is_footprint: options.is_footprint,
        }),
        ...(options?.snippet_name && { snippet_name: options.snippet_name }),
      }
      return { ...state, snippets: updatedSnippets }
    })
  },
  getSnippetById: (snippet_id: string): Snippet | undefined => {
    const state = get()
    return state.snippets.find((snippet) => snippet.snippet_id === snippet_id)
  },
  searchSnippets: (query: string): Snippet[] => {
    const state = get()
    const lowercaseQuery = query.toLowerCase()
    return state.snippets.filter(
      (snippet) =>
        snippet.name.toLowerCase().includes(lowercaseQuery) ||
        snippet.description?.toLowerCase().includes(lowercaseQuery) ||
        snippet.code.toLowerCase().includes(lowercaseQuery),
    )
  },
  addSession: (session: Omit<Session, "session_id">): Session => {
    const newSession = { session_id: `session_${Date.now()}`, ...session }
    set((state) => ({
      sessions: [...state.sessions, newSession],
    }))
    return newSession
  },
  getSessions: ({
    account_id,
    is_cli_session,
  }: { account_id: string; is_cli_session?: boolean }): Session[] => {
    const state = get()
    return state.sessions.filter(
      (session) =>
        session.account_id === account_id &&
        (is_cli_session === undefined ||
          session.is_cli_session === is_cli_session),
    )
  },
  createLoginPage: (): LoginPage => {
    const newLoginPage: LoginPage = {
      login_page_id: `login_page_${Date.now()}`,
      login_page_auth_token: `token_${Date.now()}`,
      was_login_successful: false,
      has_been_used_to_create_session: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiration
    }
    set((state) => ({
      loginPages: [...state.loginPages, newLoginPage],
    }))
    return newLoginPage
  },
  getLoginPage: (login_page_id: string): LoginPage | undefined => {
    const state = get()
    return state.loginPages.find((lp) => lp.login_page_id === login_page_id)
  },
  updateLoginPage: (
    login_page_id: string,
    updates: Partial<LoginPage>,
  ): void => {
    set((state) => ({
      loginPages: state.loginPages.map((lp) =>
        lp.login_page_id === login_page_id ? { ...lp, ...updates } : lp,
      ),
    }))
  },
  getAccount: (account_id: string): Account | undefined => {
    const state = get()
    return state.accounts.find((account) => account.account_id === account_id)
  },
  createSession: (session: Omit<Session, "session_id">): Session => {
    const newSession = { session_id: `session_${Date.now()}`, ...session }
    set((state) => ({
      sessions: [...state.sessions, newSession],
    }))
    return newSession
  },
}))
