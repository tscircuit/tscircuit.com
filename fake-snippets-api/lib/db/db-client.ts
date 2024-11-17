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
  AccountSnippet,
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
  addAccount: (
    account: Omit<Account, "account_id"> & Partial<Pick<Account, "account_id">>,
  ) => {
    const newAccount = {
      account_id: account.account_id || `account_${get().idCounter + 1}`,
      ...account,
    }

    set((state) => {
      return {
        accounts: [...state.accounts, newAccount],
        idCounter: state.idCounter + 1,
      }
    })

    return newAccount
  },
  addSnippet: (
    snippet: Omit<z.input<typeof snippetSchema>, "snippet_id">,
  ): Snippet => {
    const newSnippetId = `snippet_${get().idCounter + 1}`
    const newSnippet = snippetSchema.parse({
      ...snippet,
      snippet_id: newSnippetId,
    })
    set((state) => {
      return {
        snippets: [...state.snippets, newSnippet],
        idCounter: state.idCounter + 1,
      }
    })
    return { ...newSnippet, snippet_id: newSnippetId }
  },
  getNewestSnippets: (limit: number): Snippet[] => {
    const state = get()
    return [...state.snippets]
      .map((snippet) => ({
        ...snippet,
        star_count: state.accountSnippets.filter(
          (as) => as.snippet_id === snippet.snippet_id && as.has_starred,
        ).length,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit)
  },
  getTrendingSnippets: (limit: number, since: string): Snippet[] => {
    const state = get()
    const sinceDate = new Date(since).getTime()

    // Get star counts within time period
    const recentStars = new Map<string, number>()
    state.accountSnippets.forEach((as) => {
      if (as.has_starred && new Date(as.created_at).getTime() >= sinceDate) {
        recentStars.set(
          as.snippet_id,
          (recentStars.get(as.snippet_id) || 0) + 1,
        )
      }
    })

    return [...state.snippets]
      .map((snippet) => ({
        ...snippet,
        star_count: recentStars.get(snippet.snippet_id) || 0,
      }))
      .sort((a, b) => b.star_count - a.star_count)
      .slice(0, limit)
  },
  getSnippetsByAuthor: (authorName?: string): Snippet[] => {
    const state = get()
    const snippets = authorName
      ? state.snippets.filter((snippet) => snippet.owner_name === authorName)
      : state.snippets
    return snippets.map((snippet) => ({
      ...snippet,
      star_count: state.accountSnippets.filter(
        (as) => as.snippet_id === snippet.snippet_id && as.has_starred,
      ).length,
    }))
  },
  getSnippetByAuthorAndName: (
    authorName: string,
    snippetName: string,
  ): Snippet | undefined => {
    const state = get()
    return state.snippets.find(
      (snippet) =>
        snippet.owner_name === authorName && snippet.name === snippetName,
    )
  },
  updateSnippet: (
    snippet_id: string,
    updates: Partial<Snippet>,
  ): Snippet | undefined => {
    let updatedSnippet: Snippet | undefined
    set((state) => {
      const snippetIndex = state.snippets.findIndex(
        (snippet) => snippet.snippet_id === snippet_id,
      )
      if (snippetIndex === -1) {
        return state
      }
      const updatedSnippets = [...state.snippets]
      updatedSnippet = {
        ...updatedSnippets[snippetIndex],
        ...updates,
        updated_at: updates.updated_at || new Date().toISOString(),
      }
      updatedSnippets[snippetIndex] = updatedSnippet
      return { ...state, snippets: updatedSnippets }
    })
    return updatedSnippet
  },
  getSnippetById: (snippet_id: string): Snippet | undefined => {
    const state = get()
    const snippet = state.snippets.find(
      (snippet) => snippet.snippet_id === snippet_id,
    )
    if (!snippet) return undefined
    return {
      ...snippet,
      star_count: state.accountSnippets.filter(
        (as) => as.snippet_id === snippet_id && as.has_starred,
      ).length,
    }
  },
  searchSnippets: (query: string): Snippet[] => {
    const state = get()
    const lowercaseQuery = query.toLowerCase()
    return state.snippets
      .filter(
        (snippet) =>
          snippet.name.toLowerCase().includes(lowercaseQuery) ||
          snippet.description?.toLowerCase().includes(lowercaseQuery) ||
          snippet.code.toLowerCase().includes(lowercaseQuery),
      )
      .map((snippet) => ({
        ...snippet,
        star_count: state.accountSnippets.filter(
          (as) => as.snippet_id === snippet.snippet_id && as.has_starred,
        ).length,
      }))
  },
  deleteSnippet: (snippet_id: string): boolean => {
    let deleted = false
    set((state) => {
      const index = state.snippets.findIndex((s) => s.snippet_id === snippet_id)
      if (index !== -1) {
        state.snippets.splice(index, 1)
        deleted = true
      }
      return state
    })
    return deleted
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
  updateAccount: (
    account_id: string,
    updates: Partial<Account>,
  ): Account | undefined => {
    let updatedAccount: Account | undefined
    set((state) => {
      const accountIndex = state.accounts.findIndex(
        (account) => account.account_id === account_id,
      )
      if (accountIndex !== -1) {
        updatedAccount = { ...state.accounts[accountIndex] }
        if (updates.shippingInfo) {
          updatedAccount.shippingInfo = {
            ...updatedAccount.shippingInfo,
            ...updates.shippingInfo,
          }
          delete updates.shippingInfo
        }
        updatedAccount = { ...updatedAccount, ...updates }
        const updatedAccounts = [...state.accounts]
        updatedAccounts[accountIndex] = updatedAccount
        return { ...state, accounts: updatedAccounts }
      }
      return state
    })
    return updatedAccount
  },
  createSession: (session: Omit<Session, "session_id">): Session => {
    const newSession = { session_id: `session_${Date.now()}`, ...session }
    set((state) => ({
      sessions: [...state.sessions, newSession],
    }))
    return newSession
  },
  addStar: (account_id: string, snippet_id: string): AccountSnippet => {
    const now = new Date().toISOString()
    const accountSnippet = {
      account_id,
      snippet_id,
      has_starred: true,
      created_at: now,
      updated_at: now,
    }
    set((state) => ({
      accountSnippets: [...state.accountSnippets, accountSnippet],
    }))
    return accountSnippet
  },
  removeStar: (account_id: string, snippet_id: string): void => {
    set((state) => ({
      accountSnippets: state.accountSnippets.filter(
        (as) => !(as.account_id === account_id && as.snippet_id === snippet_id),
      ),
    }))
  },
  hasStarred: (account_id: string, snippet_id: string): boolean => {
    const state = get()
    return state.accountSnippets.some(
      (as) =>
        as.account_id === account_id &&
        as.snippet_id === snippet_id &&
        as.has_starred,
    )
  },
}))
