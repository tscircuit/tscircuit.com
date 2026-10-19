import * as zustand_vanilla from 'zustand/vanilla';
import { z } from 'zod';
import { O as Order, a as OrderFile, b as OrderQuote, B as BugReport, c as BugReportFile, A as Account, d as AccountPackage, s as snippetSchema, S as Snippet, P as Package, e as Session, L as LoginPage, p as packageSchema, f as PackageRelease, g as packageReleaseSchema, h as PackageFile, i as AiReview, D as Datasheet, j as packageBuildSchema, k as PackageBuild, l as OrgAccount, U as UserPermissions, m as Organization, n as OrgInvitation, o as PackageDomain, q as OrgDomain, r as OrgDomainLinkedPackage } from './schema-BScZniUB.js';
import { Middleware } from 'winterspec';

declare const createDatabase: ({ seed }?: {
    seed?: boolean;
}) => zustand_vanilla.StoreApi<Omit<{
    idCounter: number;
    snippets: {
        code: string;
        snippet_id: string;
        package_release_id: string;
        name: string;
        unscoped_name: string;
        owner_name: string;
        is_starred: boolean;
        created_at: string;
        updated_at: string;
        snippet_type: "board" | "package" | "model" | "footprint";
        version: string;
        star_count: number;
        is_private: boolean;
        is_public: boolean;
        is_unlisted: boolean;
        dts?: string | undefined;
        compiled_js?: string | null | undefined;
        circuit_json?: Record<string, any>[] | null | undefined;
        manual_edits_json_content?: string | null | undefined;
        starred_at?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
    packageReleases: {
        package_release_id: string;
        created_at: string;
        version: string | null;
        display_status: "error" | "pending" | "building" | "complete";
        package_id: string;
        is_locked: boolean;
        is_latest: boolean;
        has_transpiled: boolean;
        ready_to_build: boolean;
        transpilation_display_status: "error" | "pending" | "building" | "complete";
        transpilation_in_progress: boolean;
        transpilation_logs: any[];
        transpilation_is_stale: boolean;
        ext_user_code_job_id: string | null;
        user_code_job_started_at: string | null;
        user_code_job_completed_at: string | null;
        user_code_job_completed_logs: any[] | null;
        user_code_job_error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        user_code_job_log_stream_url: string | null;
        circuit_json_build_display_status: "error" | "pending" | "building" | "complete";
        circuit_json_build_in_progress: boolean;
        circuit_json_build_logs: any[];
        circuit_json_build_is_stale: boolean;
        image_generation_display_status: "error" | "pending" | "building" | "complete";
        image_generation_in_progress: boolean;
        image_generation_logs: any[] | null;
        image_generation_is_stale: boolean;
        ai_review_requested: boolean;
        is_pr_preview: boolean;
        pr_number: number | null;
        pr_title: string | null;
        branch_name: string | null;
        pcb_preview_image_url: string | null;
        sch_preview_image_url: string | null;
        cad_preview_image_url: string | null;
        package_release_website_url: string | null;
        ai_review_text?: string | null | undefined;
        commit_sha?: string | null | undefined;
        license?: string | null | undefined;
        circuit_json_build_error?: string | null | undefined;
        circuit_json_build_error_last_updated_at?: string | null | undefined;
        transpilation_error?: string | null | undefined;
        fs_sha?: string | null | undefined;
        pcb_trace_count?: number | null | undefined;
        active_package_build_id?: string | null | undefined;
        total_build_duration_ms?: number | null | undefined;
        transpilation_started_at?: string | null | undefined;
        transpilation_completed_at?: string | null | undefined;
        circuit_json_build_started_at?: string | null | undefined;
        circuit_json_build_completed_at?: string | null | undefined;
        image_generation_started_at?: string | null | undefined;
        image_generation_completed_at?: string | null | undefined;
        image_generation_error?: string | null | undefined;
        image_generation_error_last_updated_at?: string | null | undefined;
        ai_review_started_at?: string | null | undefined;
        ai_review_completed_at?: string | null | undefined;
        ai_review_error?: any;
        ai_review_logs?: any[] | null | undefined;
        latest_package_build_id?: string | null | undefined;
        commit_message?: string | null | undefined;
        commit_author?: string | null | undefined;
    }[];
    packageFiles: {
        package_release_id: string;
        created_at: string;
        file_path: string;
        package_file_id: string;
        content_text?: string | null | undefined;
        content_bytes?: Buffer<ArrayBufferLike> | null | undefined;
        content_mimetype?: string | null | undefined;
        is_text?: boolean | undefined;
        is_release_tarball?: boolean | undefined;
        npm_pack_output?: any;
    }[];
    sessions: {
        session_id: string;
        account_id: string;
        expires_at: string;
        is_cli_session: boolean;
    }[];
    loginPages: {
        created_at: string;
        expires_at: string;
        login_page_id: string;
        login_page_auth_token: string;
        was_login_successful: boolean;
        has_been_used_to_create_session: boolean;
    }[];
    accounts: {
        created_at: Date;
        account_id: string;
        github_username: string;
        tscircuit_handle: string | null;
        personal_org_id: string | null;
        is_tscircuit_staff: boolean;
        shippingInfo?: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            phone: string;
            companyName?: string | undefined;
            apartment?: string | undefined;
        } | undefined;
        email?: string | null | undefined;
    }[];
    packages: {
        name: string;
        unscoped_name: string;
        created_at: string;
        updated_at: string;
        description: string | null;
        star_count: number;
        is_private: boolean | null;
        is_public: boolean | null;
        is_unlisted: boolean | null;
        ai_description: string | null;
        package_id: string;
        license: string | null;
        creator_account_id: string;
        owner_org_id: string;
        github_repo_full_name: string | null;
        is_snippet: boolean;
        is_board: boolean;
        is_package: boolean;
        is_model: boolean;
        is_footprint: boolean;
        is_source_from_github: boolean;
        latest_package_release_id: string | null;
        latest_version: string | null;
        website: string | null;
        ai_usage_instructions: string | null;
        latest_package_release_fs_sha: string | null;
        is_starred?: boolean | undefined;
        snippet_type?: "board" | "package" | "model" | "footprint" | undefined;
        github_installation_id?: string | null | undefined;
        owner_github_username?: string | null | undefined;
        org_owner_tscircuit_handle?: string | null | undefined;
        latest_license?: string | null | undefined;
        default_view?: "files" | "3d" | "pcb" | "schematic" | undefined;
        allow_pr_previews?: boolean | undefined;
        public_dist_enabled?: boolean | undefined;
        latest_pcb_preview_image_url?: string | null | undefined;
        latest_sch_preview_image_url?: string | null | undefined;
        latest_cad_preview_image_url?: string | null | undefined;
    }[];
    orders: {
        error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        created_at: string;
        account_id: string | null;
        order_id: string;
        is_running: boolean;
        is_started: boolean;
        is_finished: boolean;
        has_error: boolean;
        started_at: string | null;
        completed_at: string | null;
        circuit_json?: any;
        submitted_package_release_id?: string | null | undefined;
        adapted_package_release_id?: string | null | undefined;
        stripe_checkout_session_id?: string | null | undefined;
        stripe_checkout_session_url?: string | null | undefined;
        is_stripe_checkout_session_complete?: boolean | undefined;
        is_stripe_checkout_session_expired?: boolean | undefined;
        is_stripe_checkout_session_open?: boolean | undefined;
        is_stripe_payment_paid?: boolean | undefined;
    }[];
    organizations: {
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    orgAccounts: {
        created_at: string;
        account_id: string;
        org_id: string;
        org_account_id: string;
        is_owner: boolean;
        can_manage_org: boolean;
    }[];
    orgInvitations: {
        created_at: string;
        expires_at: string;
        org_id: string;
        org_invitation_id: string;
        invitee_email: string | null;
        inviter_account_id: string;
        invitation_token: string;
        is_link_invite: boolean;
        is_pending: boolean;
        is_accepted: boolean;
        is_expired: boolean;
        is_revoked: boolean;
        accepted_at: string | null;
        accepted_by_account_id: string | null;
    }[];
    orderFiles: {
        order_id: string;
        order_file_id: string;
        is_gerbers_zip: boolean;
        content_type: string;
        for_provider: string | null;
        uploaded_at: string;
        content_text: string | null;
        content_bytes: Uint8Array<ArrayBuffer> | null;
    }[];
    accountSnippets: {
        snippet_id: string;
        created_at: string;
        updated_at: string;
        account_id: string;
        has_starred: boolean;
    }[];
    accountPackages: {
        is_starred: boolean;
        created_at: string;
        updated_at: string;
        account_id: string;
        account_package_id: string;
        package_id: string;
        starred_at?: string | null | undefined;
    }[];
    orderQuotes: {
        error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        package_release_id: string | null;
        created_at: string;
        updated_at: string;
        account_id: string | null;
        has_error: boolean;
        completed_at: string | null;
        order_quote_id: string;
        is_completed: boolean;
        is_processing: boolean;
        vendor_name: string;
        quoted_components: {
            manufacturer_part_number: string | null;
            supplier_part_number: string | null;
            quantity: number;
            unit_price: number;
            total_price: number;
            available: boolean;
        }[] | null;
        bare_pcb_cost: number;
        shipping_options: {
            carrier: string;
            service: string;
            cost: number;
        }[];
        total_cost_without_shipping: number;
    }[];
    aiReviews: {
        created_at: string;
        ai_review_id: string;
        ai_review_text: string | null;
        start_processing_at: string | null;
        finished_processing_at: string | null;
        display_status: "pending" | "completed" | "failed";
        package_release_id?: string | undefined;
        processing_error?: any;
    }[];
    datasheets: {
        created_at: string;
        datasheet_id: string;
        chip_name: string;
        pin_information: {
            name: string;
            description: string;
            pin_number: string;
            capabilities: string[];
        }[] | null;
        datasheet_pdf_urls: string[] | null;
        ai_description: string | null;
    }[];
    githubInstallations: {
        created_at: string;
        updated_at: string;
        account_id: string;
        github_username: string;
        github_installation_id: string;
        installation_id: string;
        is_active: boolean;
        access_token?: string | null | undefined;
        access_token_expires_at?: string | null | undefined;
    }[];
    packageBuilds: {
        package_release_id: string;
        created_at: string;
        transpilation_in_progress: boolean;
        transpilation_logs: any[] | null;
        circuit_json_build_in_progress: boolean;
        circuit_json_build_logs: any[] | null;
        image_generation_in_progress: boolean;
        image_generation_logs: any[] | null;
        package_build_id: string;
        build_in_progress: boolean;
        build_error_last_updated_at: string;
        circuit_json_build_error?: string | null | undefined;
        transpilation_error?: string | null | undefined;
        transpilation_started_at?: string | null | undefined;
        transpilation_completed_at?: string | null | undefined;
        user_code_job_started_at?: string | null | undefined;
        user_code_job_completed_at?: string | null | undefined;
        user_code_job_completed_logs?: any[] | null | undefined;
        user_code_job_error?: any;
        user_code_job_log_stream_url?: string | null | undefined;
        circuit_json_build_started_at?: string | null | undefined;
        circuit_json_build_completed_at?: string | null | undefined;
        image_generation_started_at?: string | null | undefined;
        image_generation_completed_at?: string | null | undefined;
        image_generation_error?: string | null | undefined;
        build_started_at?: string | null | undefined;
        build_completed_at?: string | null | undefined;
        build_error?: string | null | undefined;
        package_build_website_url?: string | null | undefined;
        build_logs?: string | null | undefined;
    }[];
    bugReports: {
        created_at: string;
        bug_report_id: string;
        reporter_account_id: string;
        text: string | null;
        is_auto_deleted: boolean;
        delete_at: string | null;
        file_count: number;
    }[];
    bugReportFiles: {
        created_at: string;
        content_text: string | null;
        content_bytes: Uint8Array<ArrayBuffer> | null;
        bug_report_id: string;
        bug_report_file_id: string;
        file_path: string;
        content_mimetype: string;
        is_text: boolean;
    }[];
    packageDomains: {
        created_at: Date;
        package_domain_id: string;
        points_to: "package" | "package_release" | "package_build" | "package_release_with_tag";
        package_release_id?: string | null | undefined;
        package_id?: string | null | undefined;
        package_build_id?: string | null | undefined;
        tag?: string | null | undefined;
        default_main_component_path?: string | null | undefined;
        fully_qualified_domain_name?: string | null | undefined;
    }[];
    orgDomains: {
        created_at: Date;
        org_id: string;
        points_to: "merged_pcm_repositories";
        fully_qualified_domain_name: string;
        org_domain_id: string;
        pcm_repository_name?: string | null | undefined;
    }[];
    orgDomainLinkedPackages: {
        created_at: Date;
        points_to: "package_release";
        org_domain_linked_package_id: string;
        org_domain_id: string;
        package_release_id?: string | null | undefined;
    }[];
}, "addOrder" | "getOrderById" | "getOrderFilesByOrderId" | "addOrderQuote" | "getOrderQuoteById" | "updateOrder" | "addOrderFile" | "getOrderFileById" | "addBugReport" | "getBugReportById" | "addBugReportFile" | "getBugReportFilesByBugReportId" | "addAccount" | "addAccountPackage" | "getAccountPackageById" | "updateAccountPackage" | "deleteAccountPackage" | "addSnippet" | "getLatestSnippets" | "getTrendingSnippets" | "getPackagesByAuthor" | "getSnippetByAuthorAndName" | "updateSnippet" | "getSnippetById" | "searchSnippets" | "searchPackages" | "searchAccounts" | "searchOrgs" | "deleteSnippet" | "addSession" | "getSessions" | "createLoginPage" | "getLoginPage" | "updateLoginPage" | "getAccount" | "updateAccount" | "createSession" | "deleteSession" | "addStar" | "removeStar" | "hasStarred" | "addPackage" | "updatePackage" | "getPackageById" | "getPackageReleaseById" | "addPackageRelease" | "updatePackageRelease" | "deletePackageFile" | "addPackageFile" | "updatePackageFile" | "getStarCount" | "getPackageFilesByReleaseId" | "updatePackageReleaseFsSha" | "addAiReview" | "updateAiReview" | "getAiReviewById" | "listAiReviews" | "addDatasheet" | "getDatasheetById" | "getDatasheetByChipName" | "listDatasheets" | "updateDatasheet" | "addPackageBuild" | "getPackageBuildById" | "getPackageBuildsByReleaseId" | "updatePackageBuild" | "addOrganization" | "getOrgs" | "getOrg" | "addOrganizationAccount" | "getOrganizationAccount" | "getOrganizationAccounts" | "removeOrganizationAccount" | "updateOrganizationAccount" | "updateOrganization" | "deleteOrganization" | "deleteAccount" | "addOrgInvitation" | "getOrgInvitationByToken" | "listOrgInvitations" | "updateOrgInvitation" | "addPackageDomain" | "getPackageDomainById" | "getPackageDomainByFQDN" | "addOrgDomain" | "getOrgDomainById" | "getOrgDomainByFQDN" | "listOrgDomains" | "updateOrgDomain" | "addOrgDomainLinkedPackage" | "getOrgDomainLinkedPackageById" | "listOrgDomainLinkedPackages" | "removeOrgDomainLinkedPackage" | "deletePackageDomain" | "updatePackageDomain"> & {
    addOrder: (order: Omit<Order, "order_id">) => Order;
    getOrderById: (orderId: string) => Order | undefined;
    getOrderFilesByOrderId: (orderId: string) => OrderFile[];
    addOrderQuote: ({ account_id, package_release_id, vendor_name, }: {
        account_id: string;
        package_release_id?: string;
        vendor_name: string;
    }) => string;
    getOrderQuoteById: (orderQuoteId: string) => OrderQuote | undefined;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    addOrderFile: (orderFile: Omit<OrderFile, "order_file_id">) => OrderFile;
    getOrderFileById: (orderFileId: string) => OrderFile | undefined;
    addBugReport: ({ reporter_account_id, text, is_auto_deleted, delete_at, }: {
        reporter_account_id: string;
        text?: string | null;
        is_auto_deleted?: boolean;
        delete_at?: string | null;
    }) => BugReport;
    getBugReportById: (bugReportId: string) => BugReport | undefined;
    addBugReportFile: ({ bug_report_id, file_path, content_mimetype, is_text, content_text, content_bytes, }: {
        bug_report_id: string;
        file_path: string;
        content_mimetype: string;
        is_text: boolean;
        content_text: string | null;
        content_bytes: Uint8Array | null;
    }) => BugReportFile;
    getBugReportFilesByBugReportId: (bugReportId: string) => BugReportFile[];
    addAccount: (account: Omit<Account, "account_id" | "is_tscircuit_staff" | "created_at" | "personal_org_id"> & Partial<Pick<Account, "account_id" | "is_tscircuit_staff" | "personal_org_id">>) => {
        is_tscircuit_staff: boolean;
        created_at: Date;
        personal_org_id: string;
        github_username: string;
        tscircuit_handle: string | null;
        shippingInfo?: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            phone: string;
            companyName?: string | undefined;
            apartment?: string | undefined;
        } | undefined;
        email?: string | null | undefined;
        account_id: string;
    };
    addAccountPackage: (accountPackage: Omit<AccountPackage, "account_package_id">) => AccountPackage;
    getAccountPackageById: (accountPackageId: string) => AccountPackage | undefined;
    updateAccountPackage: (accountPackageId: string, updates: Partial<AccountPackage>) => void;
    deleteAccountPackage: (accountPackageId: string) => boolean;
    addSnippet: (snippet: Omit<z.input<typeof snippetSchema>, "snippet_id" | "package_release_id"> & {
        creator_account_id?: string;
        github_repo_full_name?: string;
        branch_name?: string;
        commit_message?: string;
        commit_author?: string;
    }) => Snippet;
    getLatestSnippets: (limit: number) => Snippet[];
    getTrendingSnippets: (limit: number, since: string) => Snippet[];
    getPackagesByAuthor: (authorName?: string) => Package[];
    getSnippetByAuthorAndName: (authorName: string, snippetName: string) => Snippet | undefined;
    updateSnippet: (snippetId: string, updates: Partial<Snippet>) => Snippet | undefined;
    getSnippetById: (snippetId: string, auth?: {
        github_username: string;
    }) => Snippet | undefined;
    searchSnippets: (query: string) => Snippet[];
    searchPackages: (query: string, account_id?: string) => Package[];
    searchAccounts: (query: string, limit?: number) => Account[];
    searchOrgs: (query: string, limit?: number) => {
        member_count: number;
        package_count: number;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    deleteSnippet: (snippetId: string) => boolean;
    addSession: (session: Omit<Session, "session_id">) => Session;
    getSessions: ({ account_id, is_cli_session, }: {
        account_id: string;
        is_cli_session?: boolean;
    }) => Session[];
    createLoginPage: () => LoginPage;
    getLoginPage: (loginPageId: string) => LoginPage | undefined;
    updateLoginPage: (loginPageId: string, updates: Partial<LoginPage>) => void;
    getAccount: (accountId: string) => Account | undefined;
    updateAccount: (accountId: string, updates: Partial<Account>) => Account | undefined;
    createSession: (session: Omit<Session, "session_id">) => Session;
    deleteSession: (sessionId: string) => boolean;
    addStar: (accountId: string, packageId: string) => AccountPackage;
    removeStar: (accountId: string, packageId: string) => void;
    hasStarred: (accountId: string, packageId: string) => boolean;
    addPackage: (_package: Omit<z.input<typeof packageSchema>, "package_id" | "github_repo_full_name">) => Package;
    updatePackage: (packageId: string, updates: Partial<Package>) => Package | undefined;
    getPackageById: (packageId: string) => Package | undefined;
    getPackageReleaseById: (packageReleaseId: string) => PackageRelease | undefined;
    addPackageRelease: (packageRelease: Omit<z.input<typeof packageReleaseSchema>, "package_release_id">) => PackageRelease;
    updatePackageRelease: (packageRelease: PackageRelease) => void;
    deletePackageFile: (packageFileId: string) => boolean;
    addPackageFile: (packageFile: Omit<PackageFile, "package_file_id">) => PackageFile;
    updatePackageFile: (packageFileId: string, updates: Partial<Omit<PackageFile, "package_file_id">>) => PackageFile;
    getStarCount: (packageId: string) => number;
    getPackageFilesByReleaseId: (packageReleaseId: string) => PackageFile[];
    /**
     * Update fs_sha for a package release based on its files
     */
    updatePackageReleaseFsSha: (packageReleaseId: string) => void;
    addAiReview: (review: Omit<AiReview, "ai_review_id">) => AiReview;
    updateAiReview: (aiReviewId: string, updates: Partial<AiReview>) => AiReview | undefined;
    getAiReviewById: (aiReviewId: string) => AiReview | undefined;
    listAiReviews: () => AiReview[];
    addDatasheet: ({ chip_name }: {
        chip_name: string;
    }) => Datasheet;
    getDatasheetById: (datasheetId: string) => Datasheet | undefined;
    getDatasheetByChipName: (chipName: string) => Datasheet | undefined;
    listDatasheets: ({ chip_name, is_popular, }?: {
        chip_name?: string;
        is_popular?: boolean;
    }) => Datasheet[];
    updateDatasheet: (datasheetId: string, updates: Partial<Datasheet>) => Datasheet | undefined;
    addPackageBuild: (packageBuild: Partial<Omit<z.input<typeof packageBuildSchema>, "package_build_id">> & {
        package_release_id: string;
    }) => PackageBuild;
    getPackageBuildById: (packageBuildId: string) => PackageBuild | undefined;
    getPackageBuildsByReleaseId: (packageReleaseId: string) => PackageBuild[];
    updatePackageBuild: (packageBuildId: string, updates: Partial<PackageBuild>) => PackageBuild | undefined;
    addOrganization: (organization: {
        name?: string;
        org_id?: string;
        is_personal_org?: boolean;
        owner_account_id: string;
        github_handle?: string;
        org_display_name?: string;
        tscircuit_handle?: string;
        avatar_url?: string | null;
    }) => {
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    };
    getOrgs: (filters?: {
        owner_account_id?: string;
        account_id?: string;
        github_handle?: string;
        tscircuit_handle?: string;
        name?: string;
    }, auth?: {
        account_id?: string;
    }) => {
        member_count: number;
        package_count: number;
        can_manage_org: boolean;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    getOrg: (filters: {
        org_id?: string;
        github_handle?: string;
        tscircuit_handle?: string;
    }, auth?: {
        account_id: string;
    }) => {
        member_count: number;
        package_count: number;
        can_manage_org: boolean;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    } | null;
    addOrganizationAccount: (organizationAccount: {
        org_id: string;
        account_id: string;
        is_owner?: boolean;
    }) => {
        created_at: string;
        account_id: string;
        org_id: string;
        org_account_id: string;
        is_owner: boolean;
        can_manage_org: boolean;
    };
    getOrganizationAccount: (filters: {
        org_id?: string;
        account_id?: string;
    }) => OrgAccount | undefined;
    getOrganizationAccounts: (filters?: {
        org_id?: string;
        account_id?: string;
    }) => OrgAccount[];
    removeOrganizationAccount: (filters: {
        org_id: string;
        account_id: string;
    }) => boolean;
    updateOrganizationAccount: (filters: {
        org_id: string;
        account_id: string;
    }, updates: Partial<UserPermissions>) => OrgAccount | undefined;
    updateOrganization: (orgId: string, updates: Partial<Organization>) => Organization | undefined;
    deleteOrganization: (orgId: string) => boolean;
    deleteAccount: (accountId: string) => boolean;
    addOrgInvitation: (invitation: {
        org_id: string;
        invitee_email: string;
        inviter_account_id: string;
        invitation_token: string;
    }) => OrgInvitation;
    getOrgInvitationByToken: (token: string) => OrgInvitation | undefined;
    listOrgInvitations: (orgId: string) => OrgInvitation[];
    updateOrgInvitation: (invitationId: string, updates: Partial<OrgInvitation>) => OrgInvitation | undefined;
    addPackageDomain: (domain: Omit<PackageDomain, "package_domain_id" | "created_at">) => PackageDomain;
    getPackageDomainById: (packageDomainId: string) => PackageDomain | undefined;
    getPackageDomainByFQDN: (fullyQualifiedDomainName: string) => PackageDomain | undefined;
    addOrgDomain: (domain: Omit<OrgDomain, "org_domain_id" | "created_at">) => OrgDomain;
    getOrgDomainById: (orgDomainId: string) => OrgDomain | undefined;
    getOrgDomainByFQDN: (fullyQualifiedDomainName: string) => OrgDomain | undefined;
    listOrgDomains: (filters?: {
        org_id?: string;
    }) => OrgDomain[];
    updateOrgDomain: (orgDomainId: string, updates: Partial<Omit<OrgDomain, "org_domain_id" | "created_at">>) => OrgDomain | undefined;
    addOrgDomainLinkedPackage: (linkedPackage: Omit<OrgDomainLinkedPackage, "org_domain_linked_package_id" | "created_at">) => OrgDomainLinkedPackage;
    getOrgDomainLinkedPackageById: (orgDomainLinkedPackageId: string) => OrgDomainLinkedPackage | undefined;
    listOrgDomainLinkedPackages: (orgDomainId: string) => OrgDomainLinkedPackage[];
    removeOrgDomainLinkedPackage: (orgDomainLinkedPackageId: string) => OrgDomainLinkedPackage | undefined;
    deletePackageDomain: (packageDomainId: string) => boolean;
    updatePackageDomain: (packageDomainId: string, updates: Partial<Omit<PackageDomain, "package_domain_id" | "created_at">>) => PackageDomain | undefined;
}> & Omit<{
    idCounter: number;
    snippets: {
        code: string;
        snippet_id: string;
        package_release_id: string;
        name: string;
        unscoped_name: string;
        owner_name: string;
        is_starred: boolean;
        created_at: string;
        updated_at: string;
        snippet_type: "board" | "package" | "model" | "footprint";
        version: string;
        star_count: number;
        is_private: boolean;
        is_public: boolean;
        is_unlisted: boolean;
        dts?: string | undefined;
        compiled_js?: string | null | undefined;
        circuit_json?: Record<string, any>[] | null | undefined;
        manual_edits_json_content?: string | null | undefined;
        starred_at?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }[];
    packageReleases: {
        package_release_id: string;
        created_at: string;
        version: string | null;
        display_status: "error" | "pending" | "building" | "complete";
        package_id: string;
        is_locked: boolean;
        is_latest: boolean;
        has_transpiled: boolean;
        ready_to_build: boolean;
        transpilation_display_status: "error" | "pending" | "building" | "complete";
        transpilation_in_progress: boolean;
        transpilation_logs: any[];
        transpilation_is_stale: boolean;
        ext_user_code_job_id: string | null;
        user_code_job_started_at: string | null;
        user_code_job_completed_at: string | null;
        user_code_job_completed_logs: any[] | null;
        user_code_job_error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        user_code_job_log_stream_url: string | null;
        circuit_json_build_display_status: "error" | "pending" | "building" | "complete";
        circuit_json_build_in_progress: boolean;
        circuit_json_build_logs: any[];
        circuit_json_build_is_stale: boolean;
        image_generation_display_status: "error" | "pending" | "building" | "complete";
        image_generation_in_progress: boolean;
        image_generation_logs: any[] | null;
        image_generation_is_stale: boolean;
        ai_review_requested: boolean;
        is_pr_preview: boolean;
        pr_number: number | null;
        pr_title: string | null;
        branch_name: string | null;
        pcb_preview_image_url: string | null;
        sch_preview_image_url: string | null;
        cad_preview_image_url: string | null;
        package_release_website_url: string | null;
        ai_review_text?: string | null | undefined;
        commit_sha?: string | null | undefined;
        license?: string | null | undefined;
        circuit_json_build_error?: string | null | undefined;
        circuit_json_build_error_last_updated_at?: string | null | undefined;
        transpilation_error?: string | null | undefined;
        fs_sha?: string | null | undefined;
        pcb_trace_count?: number | null | undefined;
        active_package_build_id?: string | null | undefined;
        total_build_duration_ms?: number | null | undefined;
        transpilation_started_at?: string | null | undefined;
        transpilation_completed_at?: string | null | undefined;
        circuit_json_build_started_at?: string | null | undefined;
        circuit_json_build_completed_at?: string | null | undefined;
        image_generation_started_at?: string | null | undefined;
        image_generation_completed_at?: string | null | undefined;
        image_generation_error?: string | null | undefined;
        image_generation_error_last_updated_at?: string | null | undefined;
        ai_review_started_at?: string | null | undefined;
        ai_review_completed_at?: string | null | undefined;
        ai_review_error?: any;
        ai_review_logs?: any[] | null | undefined;
        latest_package_build_id?: string | null | undefined;
        commit_message?: string | null | undefined;
        commit_author?: string | null | undefined;
    }[];
    packageFiles: {
        package_release_id: string;
        created_at: string;
        file_path: string;
        package_file_id: string;
        content_text?: string | null | undefined;
        content_bytes?: Buffer<ArrayBufferLike> | null | undefined;
        content_mimetype?: string | null | undefined;
        is_text?: boolean | undefined;
        is_release_tarball?: boolean | undefined;
        npm_pack_output?: any;
    }[];
    sessions: {
        session_id: string;
        account_id: string;
        expires_at: string;
        is_cli_session: boolean;
    }[];
    loginPages: {
        created_at: string;
        expires_at: string;
        login_page_id: string;
        login_page_auth_token: string;
        was_login_successful: boolean;
        has_been_used_to_create_session: boolean;
    }[];
    accounts: {
        created_at: Date;
        account_id: string;
        github_username: string;
        tscircuit_handle: string | null;
        personal_org_id: string | null;
        is_tscircuit_staff: boolean;
        shippingInfo?: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            phone: string;
            companyName?: string | undefined;
            apartment?: string | undefined;
        } | undefined;
        email?: string | null | undefined;
    }[];
    packages: {
        name: string;
        unscoped_name: string;
        created_at: string;
        updated_at: string;
        description: string | null;
        star_count: number;
        is_private: boolean | null;
        is_public: boolean | null;
        is_unlisted: boolean | null;
        ai_description: string | null;
        package_id: string;
        license: string | null;
        creator_account_id: string;
        owner_org_id: string;
        github_repo_full_name: string | null;
        is_snippet: boolean;
        is_board: boolean;
        is_package: boolean;
        is_model: boolean;
        is_footprint: boolean;
        is_source_from_github: boolean;
        latest_package_release_id: string | null;
        latest_version: string | null;
        website: string | null;
        ai_usage_instructions: string | null;
        latest_package_release_fs_sha: string | null;
        is_starred?: boolean | undefined;
        snippet_type?: "board" | "package" | "model" | "footprint" | undefined;
        github_installation_id?: string | null | undefined;
        owner_github_username?: string | null | undefined;
        org_owner_tscircuit_handle?: string | null | undefined;
        latest_license?: string | null | undefined;
        default_view?: "files" | "3d" | "pcb" | "schematic" | undefined;
        allow_pr_previews?: boolean | undefined;
        public_dist_enabled?: boolean | undefined;
        latest_pcb_preview_image_url?: string | null | undefined;
        latest_sch_preview_image_url?: string | null | undefined;
        latest_cad_preview_image_url?: string | null | undefined;
    }[];
    orders: {
        error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        created_at: string;
        account_id: string | null;
        order_id: string;
        is_running: boolean;
        is_started: boolean;
        is_finished: boolean;
        has_error: boolean;
        started_at: string | null;
        completed_at: string | null;
        circuit_json?: any;
        submitted_package_release_id?: string | null | undefined;
        adapted_package_release_id?: string | null | undefined;
        stripe_checkout_session_id?: string | null | undefined;
        stripe_checkout_session_url?: string | null | undefined;
        is_stripe_checkout_session_complete?: boolean | undefined;
        is_stripe_checkout_session_expired?: boolean | undefined;
        is_stripe_checkout_session_open?: boolean | undefined;
        is_stripe_payment_paid?: boolean | undefined;
    }[];
    organizations: {
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    orgAccounts: {
        created_at: string;
        account_id: string;
        org_id: string;
        org_account_id: string;
        is_owner: boolean;
        can_manage_org: boolean;
    }[];
    orgInvitations: {
        created_at: string;
        expires_at: string;
        org_id: string;
        org_invitation_id: string;
        invitee_email: string | null;
        inviter_account_id: string;
        invitation_token: string;
        is_link_invite: boolean;
        is_pending: boolean;
        is_accepted: boolean;
        is_expired: boolean;
        is_revoked: boolean;
        accepted_at: string | null;
        accepted_by_account_id: string | null;
    }[];
    orderFiles: {
        order_id: string;
        order_file_id: string;
        is_gerbers_zip: boolean;
        content_type: string;
        for_provider: string | null;
        uploaded_at: string;
        content_text: string | null;
        content_bytes: Uint8Array<ArrayBuffer> | null;
    }[];
    accountSnippets: {
        snippet_id: string;
        created_at: string;
        updated_at: string;
        account_id: string;
        has_starred: boolean;
    }[];
    accountPackages: {
        is_starred: boolean;
        created_at: string;
        updated_at: string;
        account_id: string;
        account_package_id: string;
        package_id: string;
        starred_at?: string | null | undefined;
    }[];
    orderQuotes: {
        error: z.objectOutputType<{
            error_code: z.ZodString;
            message: z.ZodString;
        }, z.ZodTypeAny, "passthrough"> | null;
        package_release_id: string | null;
        created_at: string;
        updated_at: string;
        account_id: string | null;
        has_error: boolean;
        completed_at: string | null;
        order_quote_id: string;
        is_completed: boolean;
        is_processing: boolean;
        vendor_name: string;
        quoted_components: {
            manufacturer_part_number: string | null;
            supplier_part_number: string | null;
            quantity: number;
            unit_price: number;
            total_price: number;
            available: boolean;
        }[] | null;
        bare_pcb_cost: number;
        shipping_options: {
            carrier: string;
            service: string;
            cost: number;
        }[];
        total_cost_without_shipping: number;
    }[];
    aiReviews: {
        created_at: string;
        ai_review_id: string;
        ai_review_text: string | null;
        start_processing_at: string | null;
        finished_processing_at: string | null;
        display_status: "pending" | "completed" | "failed";
        package_release_id?: string | undefined;
        processing_error?: any;
    }[];
    datasheets: {
        created_at: string;
        datasheet_id: string;
        chip_name: string;
        pin_information: {
            name: string;
            description: string;
            pin_number: string;
            capabilities: string[];
        }[] | null;
        datasheet_pdf_urls: string[] | null;
        ai_description: string | null;
    }[];
    githubInstallations: {
        created_at: string;
        updated_at: string;
        account_id: string;
        github_username: string;
        github_installation_id: string;
        installation_id: string;
        is_active: boolean;
        access_token?: string | null | undefined;
        access_token_expires_at?: string | null | undefined;
    }[];
    packageBuilds: {
        package_release_id: string;
        created_at: string;
        transpilation_in_progress: boolean;
        transpilation_logs: any[] | null;
        circuit_json_build_in_progress: boolean;
        circuit_json_build_logs: any[] | null;
        image_generation_in_progress: boolean;
        image_generation_logs: any[] | null;
        package_build_id: string;
        build_in_progress: boolean;
        build_error_last_updated_at: string;
        circuit_json_build_error?: string | null | undefined;
        transpilation_error?: string | null | undefined;
        transpilation_started_at?: string | null | undefined;
        transpilation_completed_at?: string | null | undefined;
        user_code_job_started_at?: string | null | undefined;
        user_code_job_completed_at?: string | null | undefined;
        user_code_job_completed_logs?: any[] | null | undefined;
        user_code_job_error?: any;
        user_code_job_log_stream_url?: string | null | undefined;
        circuit_json_build_started_at?: string | null | undefined;
        circuit_json_build_completed_at?: string | null | undefined;
        image_generation_started_at?: string | null | undefined;
        image_generation_completed_at?: string | null | undefined;
        image_generation_error?: string | null | undefined;
        build_started_at?: string | null | undefined;
        build_completed_at?: string | null | undefined;
        build_error?: string | null | undefined;
        package_build_website_url?: string | null | undefined;
        build_logs?: string | null | undefined;
    }[];
    bugReports: {
        created_at: string;
        bug_report_id: string;
        reporter_account_id: string;
        text: string | null;
        is_auto_deleted: boolean;
        delete_at: string | null;
        file_count: number;
    }[];
    bugReportFiles: {
        created_at: string;
        content_text: string | null;
        content_bytes: Uint8Array<ArrayBuffer> | null;
        bug_report_id: string;
        bug_report_file_id: string;
        file_path: string;
        content_mimetype: string;
        is_text: boolean;
    }[];
    packageDomains: {
        created_at: Date;
        package_domain_id: string;
        points_to: "package" | "package_release" | "package_build" | "package_release_with_tag";
        package_release_id?: string | null | undefined;
        package_id?: string | null | undefined;
        package_build_id?: string | null | undefined;
        tag?: string | null | undefined;
        default_main_component_path?: string | null | undefined;
        fully_qualified_domain_name?: string | null | undefined;
    }[];
    orgDomains: {
        created_at: Date;
        org_id: string;
        points_to: "merged_pcm_repositories";
        fully_qualified_domain_name: string;
        org_domain_id: string;
        pcm_repository_name?: string | null | undefined;
    }[];
    orgDomainLinkedPackages: {
        created_at: Date;
        points_to: "package_release";
        org_domain_linked_package_id: string;
        org_domain_id: string;
        package_release_id?: string | null | undefined;
    }[];
}, "addOrder" | "getOrderById" | "getOrderFilesByOrderId" | "addOrderQuote" | "getOrderQuoteById" | "updateOrder" | "addOrderFile" | "getOrderFileById" | "addBugReport" | "getBugReportById" | "addBugReportFile" | "getBugReportFilesByBugReportId" | "addAccount" | "addAccountPackage" | "getAccountPackageById" | "updateAccountPackage" | "deleteAccountPackage" | "addSnippet" | "getLatestSnippets" | "getTrendingSnippets" | "getPackagesByAuthor" | "getSnippetByAuthorAndName" | "updateSnippet" | "getSnippetById" | "searchSnippets" | "searchPackages" | "searchAccounts" | "searchOrgs" | "deleteSnippet" | "addSession" | "getSessions" | "createLoginPage" | "getLoginPage" | "updateLoginPage" | "getAccount" | "updateAccount" | "createSession" | "deleteSession" | "addStar" | "removeStar" | "hasStarred" | "addPackage" | "updatePackage" | "getPackageById" | "getPackageReleaseById" | "addPackageRelease" | "updatePackageRelease" | "deletePackageFile" | "addPackageFile" | "updatePackageFile" | "getStarCount" | "getPackageFilesByReleaseId" | "updatePackageReleaseFsSha" | "addAiReview" | "updateAiReview" | "getAiReviewById" | "listAiReviews" | "addDatasheet" | "getDatasheetById" | "getDatasheetByChipName" | "listDatasheets" | "updateDatasheet" | "addPackageBuild" | "getPackageBuildById" | "getPackageBuildsByReleaseId" | "updatePackageBuild" | "addOrganization" | "getOrgs" | "getOrg" | "addOrganizationAccount" | "getOrganizationAccount" | "getOrganizationAccounts" | "removeOrganizationAccount" | "updateOrganizationAccount" | "updateOrganization" | "deleteOrganization" | "deleteAccount" | "addOrgInvitation" | "getOrgInvitationByToken" | "listOrgInvitations" | "updateOrgInvitation" | "addPackageDomain" | "getPackageDomainById" | "getPackageDomainByFQDN" | "addOrgDomain" | "getOrgDomainById" | "getOrgDomainByFQDN" | "listOrgDomains" | "updateOrgDomain" | "addOrgDomainLinkedPackage" | "getOrgDomainLinkedPackageById" | "listOrgDomainLinkedPackages" | "removeOrgDomainLinkedPackage" | "deletePackageDomain" | "updatePackageDomain"> & {
    addOrder: (order: Omit<Order, "order_id">) => Order;
    getOrderById: (orderId: string) => Order | undefined;
    getOrderFilesByOrderId: (orderId: string) => OrderFile[];
    addOrderQuote: ({ account_id, package_release_id, vendor_name, }: {
        account_id: string;
        package_release_id?: string;
        vendor_name: string;
    }) => string;
    getOrderQuoteById: (orderQuoteId: string) => OrderQuote | undefined;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    addOrderFile: (orderFile: Omit<OrderFile, "order_file_id">) => OrderFile;
    getOrderFileById: (orderFileId: string) => OrderFile | undefined;
    addBugReport: ({ reporter_account_id, text, is_auto_deleted, delete_at, }: {
        reporter_account_id: string;
        text?: string | null;
        is_auto_deleted?: boolean;
        delete_at?: string | null;
    }) => BugReport;
    getBugReportById: (bugReportId: string) => BugReport | undefined;
    addBugReportFile: ({ bug_report_id, file_path, content_mimetype, is_text, content_text, content_bytes, }: {
        bug_report_id: string;
        file_path: string;
        content_mimetype: string;
        is_text: boolean;
        content_text: string | null;
        content_bytes: Uint8Array | null;
    }) => BugReportFile;
    getBugReportFilesByBugReportId: (bugReportId: string) => BugReportFile[];
    addAccount: (account: Omit<Account, "account_id" | "is_tscircuit_staff" | "created_at" | "personal_org_id"> & Partial<Pick<Account, "account_id" | "is_tscircuit_staff" | "personal_org_id">>) => {
        is_tscircuit_staff: boolean;
        created_at: Date;
        personal_org_id: string;
        github_username: string;
        tscircuit_handle: string | null;
        shippingInfo?: {
            firstName: string;
            lastName: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            phone: string;
            companyName?: string | undefined;
            apartment?: string | undefined;
        } | undefined;
        email?: string | null | undefined;
        account_id: string;
    };
    addAccountPackage: (accountPackage: Omit<AccountPackage, "account_package_id">) => AccountPackage;
    getAccountPackageById: (accountPackageId: string) => AccountPackage | undefined;
    updateAccountPackage: (accountPackageId: string, updates: Partial<AccountPackage>) => void;
    deleteAccountPackage: (accountPackageId: string) => boolean;
    addSnippet: (snippet: Omit<z.input<typeof snippetSchema>, "snippet_id" | "package_release_id"> & {
        creator_account_id?: string;
        github_repo_full_name?: string;
        branch_name?: string;
        commit_message?: string;
        commit_author?: string;
    }) => Snippet;
    getLatestSnippets: (limit: number) => Snippet[];
    getTrendingSnippets: (limit: number, since: string) => Snippet[];
    getPackagesByAuthor: (authorName?: string) => Package[];
    getSnippetByAuthorAndName: (authorName: string, snippetName: string) => Snippet | undefined;
    updateSnippet: (snippetId: string, updates: Partial<Snippet>) => Snippet | undefined;
    getSnippetById: (snippetId: string, auth?: {
        github_username: string;
    }) => Snippet | undefined;
    searchSnippets: (query: string) => Snippet[];
    searchPackages: (query: string, account_id?: string) => Package[];
    searchAccounts: (query: string, limit?: number) => Account[];
    searchOrgs: (query: string, limit?: number) => {
        member_count: number;
        package_count: number;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    deleteSnippet: (snippetId: string) => boolean;
    addSession: (session: Omit<Session, "session_id">) => Session;
    getSessions: ({ account_id, is_cli_session, }: {
        account_id: string;
        is_cli_session?: boolean;
    }) => Session[];
    createLoginPage: () => LoginPage;
    getLoginPage: (loginPageId: string) => LoginPage | undefined;
    updateLoginPage: (loginPageId: string, updates: Partial<LoginPage>) => void;
    getAccount: (accountId: string) => Account | undefined;
    updateAccount: (accountId: string, updates: Partial<Account>) => Account | undefined;
    createSession: (session: Omit<Session, "session_id">) => Session;
    deleteSession: (sessionId: string) => boolean;
    addStar: (accountId: string, packageId: string) => AccountPackage;
    removeStar: (accountId: string, packageId: string) => void;
    hasStarred: (accountId: string, packageId: string) => boolean;
    addPackage: (_package: Omit<z.input<typeof packageSchema>, "package_id" | "github_repo_full_name">) => Package;
    updatePackage: (packageId: string, updates: Partial<Package>) => Package | undefined;
    getPackageById: (packageId: string) => Package | undefined;
    getPackageReleaseById: (packageReleaseId: string) => PackageRelease | undefined;
    addPackageRelease: (packageRelease: Omit<z.input<typeof packageReleaseSchema>, "package_release_id">) => PackageRelease;
    updatePackageRelease: (packageRelease: PackageRelease) => void;
    deletePackageFile: (packageFileId: string) => boolean;
    addPackageFile: (packageFile: Omit<PackageFile, "package_file_id">) => PackageFile;
    updatePackageFile: (packageFileId: string, updates: Partial<Omit<PackageFile, "package_file_id">>) => PackageFile;
    getStarCount: (packageId: string) => number;
    getPackageFilesByReleaseId: (packageReleaseId: string) => PackageFile[];
    /**
     * Update fs_sha for a package release based on its files
     */
    updatePackageReleaseFsSha: (packageReleaseId: string) => void;
    addAiReview: (review: Omit<AiReview, "ai_review_id">) => AiReview;
    updateAiReview: (aiReviewId: string, updates: Partial<AiReview>) => AiReview | undefined;
    getAiReviewById: (aiReviewId: string) => AiReview | undefined;
    listAiReviews: () => AiReview[];
    addDatasheet: ({ chip_name }: {
        chip_name: string;
    }) => Datasheet;
    getDatasheetById: (datasheetId: string) => Datasheet | undefined;
    getDatasheetByChipName: (chipName: string) => Datasheet | undefined;
    listDatasheets: ({ chip_name, is_popular, }?: {
        chip_name?: string;
        is_popular?: boolean;
    }) => Datasheet[];
    updateDatasheet: (datasheetId: string, updates: Partial<Datasheet>) => Datasheet | undefined;
    addPackageBuild: (packageBuild: Partial<Omit<z.input<typeof packageBuildSchema>, "package_build_id">> & {
        package_release_id: string;
    }) => PackageBuild;
    getPackageBuildById: (packageBuildId: string) => PackageBuild | undefined;
    getPackageBuildsByReleaseId: (packageReleaseId: string) => PackageBuild[];
    updatePackageBuild: (packageBuildId: string, updates: Partial<PackageBuild>) => PackageBuild | undefined;
    addOrganization: (organization: {
        name?: string;
        org_id?: string;
        is_personal_org?: boolean;
        owner_account_id: string;
        github_handle?: string;
        org_display_name?: string;
        tscircuit_handle?: string;
        avatar_url?: string | null;
    }) => {
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    };
    getOrgs: (filters?: {
        owner_account_id?: string;
        account_id?: string;
        github_handle?: string;
        tscircuit_handle?: string;
        name?: string;
    }, auth?: {
        account_id?: string;
    }) => {
        member_count: number;
        package_count: number;
        can_manage_org: boolean;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    }[];
    getOrg: (filters: {
        org_id?: string;
        github_handle?: string;
        tscircuit_handle?: string;
    }, auth?: {
        account_id: string;
    }) => {
        member_count: number;
        package_count: number;
        can_manage_org: boolean;
        created_at: string;
        tscircuit_handle: string | null;
        org_id: string;
        owner_account_id: string;
        is_personal_org: boolean;
        github_handle: string | null;
        org_display_name?: string | undefined;
        avatar_url?: string | null | undefined;
    } | null;
    addOrganizationAccount: (organizationAccount: {
        org_id: string;
        account_id: string;
        is_owner?: boolean;
    }) => {
        created_at: string;
        account_id: string;
        org_id: string;
        org_account_id: string;
        is_owner: boolean;
        can_manage_org: boolean;
    };
    getOrganizationAccount: (filters: {
        org_id?: string;
        account_id?: string;
    }) => OrgAccount | undefined;
    getOrganizationAccounts: (filters?: {
        org_id?: string;
        account_id?: string;
    }) => OrgAccount[];
    removeOrganizationAccount: (filters: {
        org_id: string;
        account_id: string;
    }) => boolean;
    updateOrganizationAccount: (filters: {
        org_id: string;
        account_id: string;
    }, updates: Partial<UserPermissions>) => OrgAccount | undefined;
    updateOrganization: (orgId: string, updates: Partial<Organization>) => Organization | undefined;
    deleteOrganization: (orgId: string) => boolean;
    deleteAccount: (accountId: string) => boolean;
    addOrgInvitation: (invitation: {
        org_id: string;
        invitee_email: string;
        inviter_account_id: string;
        invitation_token: string;
    }) => OrgInvitation;
    getOrgInvitationByToken: (token: string) => OrgInvitation | undefined;
    listOrgInvitations: (orgId: string) => OrgInvitation[];
    updateOrgInvitation: (invitationId: string, updates: Partial<OrgInvitation>) => OrgInvitation | undefined;
    addPackageDomain: (domain: Omit<PackageDomain, "package_domain_id" | "created_at">) => PackageDomain;
    getPackageDomainById: (packageDomainId: string) => PackageDomain | undefined;
    getPackageDomainByFQDN: (fullyQualifiedDomainName: string) => PackageDomain | undefined;
    addOrgDomain: (domain: Omit<OrgDomain, "org_domain_id" | "created_at">) => OrgDomain;
    getOrgDomainById: (orgDomainId: string) => OrgDomain | undefined;
    getOrgDomainByFQDN: (fullyQualifiedDomainName: string) => OrgDomain | undefined;
    listOrgDomains: (filters?: {
        org_id?: string;
    }) => OrgDomain[];
    updateOrgDomain: (orgDomainId: string, updates: Partial<Omit<OrgDomain, "org_domain_id" | "created_at">>) => OrgDomain | undefined;
    addOrgDomainLinkedPackage: (linkedPackage: Omit<OrgDomainLinkedPackage, "org_domain_linked_package_id" | "created_at">) => OrgDomainLinkedPackage;
    getOrgDomainLinkedPackageById: (orgDomainLinkedPackageId: string) => OrgDomainLinkedPackage | undefined;
    listOrgDomainLinkedPackages: (orgDomainId: string) => OrgDomainLinkedPackage[];
    removeOrgDomainLinkedPackage: (orgDomainLinkedPackageId: string) => OrgDomainLinkedPackage | undefined;
    deletePackageDomain: (packageDomainId: string) => boolean;
    updatePackageDomain: (packageDomainId: string, updates: Partial<Omit<PackageDomain, "package_domain_id" | "created_at">>) => PackageDomain | undefined;
};
type DbClient = ReturnType<typeof createDatabase>;

declare const seed: (db: DbClient) => void;

declare const withDb: Middleware<{}, {
    db: DbClient;
}>;

export { type DbClient, createDatabase, seed, withDb };
