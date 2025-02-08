.next/types/app/vendors/[id]/page.ts(34,29): error TS2344: Type 'Props' does not satisfy the constraint 'PageProps'.
  Types of property 'params' are incompatible.
    Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
cypress/e2e/invoice-flow.cy.ts(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
cypress/e2e/invoice-flow.cy.ts(9,8): error TS2339: Property 'setupTestSession' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/invoice-flow.cy.ts(33,8): error TS2339: Property 'createInvoice' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/invoice-flow.cy.ts(54,8): error TS2339: Property 'createInvoice' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/invoice-validation.cy.ts(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
cypress/e2e/invoice-validation.cy.ts(7,3): error TS2305: Module '"../support/helpers"' has no exported member 'createTestInvoice'.
cypress/e2e/invoice-validation.cy.ts(8,3): error TS2305: Module '"../support/helpers"' has no exported member 'createTestVendor'.
cypress/e2e/invoice-validation.cy.ts(9,3): error TS2305: Module '"../support/helpers"' has no exported member 'assertErrorMessage'.
cypress/e2e/invoice-validation.cy.ts(10,3): error TS2305: Module '"../support/helpers"' has no exported member 'assertTaxCalculation'.
cypress/e2e/invoice-validation.cy.ts(11,3): error TS2305: Module '"../support/helpers"' has no exported member 'assertPagination'.
cypress/e2e/invoice-validation.cy.ts(25,8): error TS2339: Property 'setupTestUser' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/invoice-validation.cy.ts(124,8): error TS2339: Property 'setupTestSession' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/order-items.cy.ts(7,8): error TS2339: Property 'setupTestSession' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/performance.cy.ts(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
cypress/e2e/performance.cy.ts(10,8): error TS2339: Property 'setupTestSession' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/tags.cy.ts(15,8): error TS2339: Property 'setupTestSession' does not exist on type 'cy & CyEventEmitter'.
cypress/e2e/tags.cy.ts(17,8): error TS2339: Property 'setupTestUser' does not exist on type 'cy & CyEventEmitter'.
cypress/plugins/index.ts(17,15): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
cypress/plugins/index.ts(25,15): error TS2353: Object literal may only specify known properties, and 'category' does not exist in type 'Without<VendorCreateInput, VendorUncheckedCreateInput> & VendorUncheckedCreateInput'.
cypress/plugins/index.ts(31,50): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
cypress/plugins/index.ts(46,15): error TS2353: Object literal may only specify known properties, and 'purchaseOrderId' does not exist in type 'Without<InvoiceCreateInput, InvoiceUncheckedCreateInput> & InvoiceUncheckedCreateInput'.
cypress/plugins/index.ts(57,40): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
e2e/auth-basic.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/auth-basic.spec.ts(7,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth-basic.spec.ts(15,35): error TS7006: Parameter 'c' implicitly has an 'any' type.
e2e/auth-basic.spec.ts(43,33): error TS7006: Parameter 'c' implicitly has an 'any' type.
e2e/auth-manual.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/auth-manual.spec.ts(2,19): error TS2307: Cannot find module 'node-fetch' or its corresponding type declarations.
e2e/auth-manual.spec.ts(5,35): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.setup.ts(1,31): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/auth.setup.ts(6,28): error TS7031: Binding element 'browser' implicitly has an 'any' type.
e2e/auth.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/auth.spec.ts(11,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(15,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(34,49): error TS7006: Parameter 'response' implicitly has an 'any' type.
e2e/auth.spec.ts(43,34): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(56,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(69,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(69,37): error TS7031: Binding element 'context' implicitly has an 'any' type.
e2e/auth.spec.ts(80,40): error TS7006: Parameter 'c' implicitly has an 'any' type.
e2e/auth.spec.ts(91,34): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(91,40): error TS7031: Binding element 'context' implicitly has an 'any' type.
e2e/auth.spec.ts(106,40): error TS7006: Parameter 'c' implicitly has an 'any' type.
e2e/auth.spec.ts(110,30): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/auth.spec.ts(137,32): error TS7031: Binding element 'browser' implicitly has an 'any' type.
e2e/global-setup.ts(1,38): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/global-setup.ts(3,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
e2e/global-setup.ts(4,20): error TS2307: Cannot find module 'dotenv' or its corresponding type declarations.
e2e/global-setup.ts(34,17): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type 'InvoiceWhereInput'.
e2e/global-setup.ts(40,18): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global-setup.ts(54,17): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type 'VendorWhereInput'.
e2e/global-setup.ts(60,18): error TS2339: Property 'session' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global-setup.ts(65,18): error TS2339: Property 'account' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global-setup.ts(79,11): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
e2e/global-teardown.ts(1,28): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/global-teardown.ts(23,17): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type 'InvoiceWhereInput'.
e2e/global-teardown.ts(29,18): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global-teardown.ts(43,17): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type 'VendorWhereInput'.
e2e/global-teardown.ts(49,18): error TS2339: Property 'session' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global-teardown.ts(54,18): error TS2339: Property 'account' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
e2e/global.setup.ts(1,31): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/global.setup.ts(2,32): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
e2e/global.setup.ts(3,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
e2e/global.setup.ts(12,12): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
e2e/global.setup.ts(23,7): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
e2e/global.setup.ts(32,7): error TS2353: Object literal may only specify known properties, and 'registrationNumber' does not exist in type 'Without<VendorUncheckedCreateInput, VendorCreateInput> & VendorCreateInput'.
e2e/global.setup.ts(64,7): error TS2322: Type '"PENDING"' is not assignable to type 'InvoiceStatus | undefined'.
e2e/helpers/auth.helper.ts(1,22): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/helpers/purchase-order.helper.ts(1,22): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/invoice-flow.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/invoice-flow.spec.ts(7,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(13,39): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(52,35): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(79,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(85,38): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(125,40): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice-flow.spec.ts(141,39): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/invoice.spec.ts(2,10): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'commonValidation'.
e2e/invoice.spec.ts(6,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(24,33): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(36,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(52,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(72,33): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(89,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(93,27): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(111,27): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(121,32): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/invoice.spec.ts(130,35): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-form-basic.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/purchase-form-basic.spec.ts(5,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-form-basic.spec.ts(9,34): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/purchase-order-flow.spec.ts(7,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(13,37): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(58,38): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(100,35): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(118,30): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order-flow.spec.ts(141,29): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/purchase-order.spec.ts(6,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order.spec.ts(62,34): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order.spec.ts(79,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order.spec.ts(95,30): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/purchase-order.spec.ts(126,37): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/tags.spec.ts(4,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(16,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(26,26): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(44,26): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(60,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/tags.spec.ts(69,30): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/vendor.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
e2e/vendor.spec.ts(6,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/vendor.spec.ts(10,29): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/vendor.spec.ts(29,29): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/vendor.spec.ts(39,27): error TS7031: Binding element 'page' implicitly has an 'any' type.
e2e/vendor.spec.ts(48,29): error TS7031: Binding element 'page' implicitly has an 'any' type.
playwright.config.ts(1,39): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
playwright.config.ts(2,20): error TS2307: Cannot find module 'dotenv' or its corresponding type declarations.
src/app/_app.tsx(4,50): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/app/actions/invoice.ts(33,18): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/auth/[...nextauth]/auth-options.ts(1,31): error TS2307: Cannot find module '@next-auth/prisma-adapter' or its corresponding type declarations.
src/app/api/auth/[...nextauth]/auth-options.ts(7,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/auth/[...nextauth]/auth-options.ts(93,43): error TS2339: Property 'session' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/auth/[...nextauth]/auth-options.ts(212,24): error TS2339: Property 'name' does not exist on type '{ id: string; email: string; createdAt: Date; updatedAt: Date; hashedPassword: string; role: string; }'.
src/app/api/auth/__tests__/auth.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/auth/__tests__/auth.test.ts(5,22): error TS2307: Cannot find module 'bcrypt' or its corresponding type declarations.
src/app/api/auth/__tests__/rbac.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/auth/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/auth/__tests__/route.test.ts(5,10): error TS2305: Module '"@/lib/auth"' has no exported member 'session'.
src/app/api/auth/__tests__/session.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/auth/register.ts(4,22): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/auth/register.ts(5,22): error TS2307: Cannot find module 'jsonwebtoken' or its corresponding type declarations.
src/app/api/auth/register.ts(66,9): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
src/app/api/auth/route.ts(3,10): error TS2305: Module '"@/lib/auth"' has no exported member 'session'.
src/app/api/auth/route.ts(4,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/auth/route.ts(53,20): error TS2339: Property 'name' does not exist on type '{ id: string; email: string; createdAt: Date; updatedAt: Date; hashedPassword: string; role: string; }'.
src/app/api/auth/route.ts(129,9): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'UserSelect<DefaultArgs>'.
src/app/api/auth/signup.ts(2,22): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/auth/signup.ts(33,9): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
src/app/api/auth/signup/route.ts(3,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/cron/__tests__/check-invoices.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/cron/__tests__/check-invoices.test.ts(22,27): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-invoices.test.ts(33,33): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(57,55): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-invoices.test.ts(65,31): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(78,33): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(94,33): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(109,40): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(122,36): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(123,36): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(158,33): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-invoices.test.ts(171,55): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-purchase-orders.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/cron/__tests__/check-purchase-orders.test.ts(2,24): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/cron/__tests__/check-purchase-orders.test.ts(22,27): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-purchase-orders.test.ts(53,61): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-purchase-orders.test.ts(163,61): error TS7031: Binding element 'data' implicitly has an 'any' type.
src/app/api/cron/__tests__/check-reminders.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/cron/__tests__/check-reminders.test.ts(5,25): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/app/api/cron/__tests__/check-reminders.test.ts(6,25): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/cron/__tests__/check-reminders.test.ts(27,27): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/cron/__tests__/check-reminders.test.ts(61,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(62,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(77,19): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(100,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(101,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(131,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(132,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(154,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(161,19): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(165,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(188,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(189,22): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/__tests__/check-reminders.test.ts(196,19): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/check-purchase-orders.ts(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/cron/check-purchase-orders.ts(10,40): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/cron/check-purchase-orders.ts(26,34): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/cron/check-purchase-orders.ts(39,18): error TS2339: Property 'statusHistory' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/cron/check-purchase-orders.ts(56,11): error TS2345: Argument of type '"statusUpdated"' is not assignable to parameter of type 'MailTemplateType'.
src/app/api/cron/payment-reminders/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/dashboard/alerts/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/dashboard/alerts/__tests__/route.test.ts(57,31): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/dashboard/alerts/__tests__/route.test.ts(67,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/dashboard/alerts/route.ts(22,31): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/dashboard/alerts/route.ts(23,9): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/app/api/dashboard/alerts/route.ts(32,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(6,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(7,25): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(88,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(97,19): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(123,19): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(132,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/recent-orders/__tests__/route.test.ts(150,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/recent-orders/route.ts(18,39): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/stats/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/dashboard/stats/route.ts(6,25): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/dashboard/stats/route.ts(22,14): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/dashboard/upcoming-payments/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/dashboard/upcoming-payments/__tests__/route.test.ts(7,25): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/dashboard/upcoming-payments/route.ts(6,25): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/dashboard/upcoming-payments/route.ts(39,9): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/app/api/dashboard/upcoming-payments/route.ts(46,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/dashboard/upcoming-payments/route.ts(49,9): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]'.
src/app/api/dashboard/upcoming-payments/route.ts(56,24): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/dashboard/upcoming-payments/route.ts(58,27): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoice-templates/[id]/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/invoice-templates/[id]/__tests__/route.test.ts(20,27): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/app/api/invoice-templates/[id]/__tests__/route.test.ts(135,20): error TS2345: Argument of type 'null' is not assignable to parameter of type 'Partial<CustomSession> | undefined'.
src/app/api/invoice-templates/[id]/create-invoice/route.ts(6,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/invoice-templates/[id]/create-invoice/route.ts(36,35): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/[id]/create-invoice/route.ts(50,9): error TS2353: Object literal may only specify known properties, and 'templateId' does not exist in type 'Without<InvoiceCreateInput, InvoiceUncheckedCreateInput> & InvoiceUncheckedCreateInput'.
src/app/api/invoice-templates/[id]/create-invoice/route.ts(81,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoice-templates/[id]/route.ts(19,35): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/[id]/route.ts(60,43): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/[id]/route.ts(73,40): error TS2339: Property 'invoiceTemplate' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/invoice-templates/[id]/route.ts(108,35): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/[id]/route.ts(132,18): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/invoice-templates/__tests__/route.test.ts(86,20): error TS2345: Argument of type 'null' is not assignable to parameter of type 'Partial<CustomSession> | undefined'.
src/app/api/invoice-templates/__tests__/route.test.ts(217,20): error TS2345: Argument of type 'null' is not assignable to parameter of type 'Partial<CustomSession> | undefined'.
src/app/api/invoice-templates/route.ts(7,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/invoice-templates/route.ts(31,36): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/route.ts(60,35): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice-templates/route.ts(77,43): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/invoice/bulk/route.ts(3,10): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceStatusType'.
src/app/api/invoice/send-email/route.ts(2,24): error TS2307: Cannot find module 'resend' or its corresponding type declarations.
src/app/api/invoice/templates/route.ts(8,36): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoice/templates/route.ts(26,35): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/[id]/payment/route.ts(26,9): error TS2353: Object literal may only specify known properties, and 'payment' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/[id]/payment/route.ts(35,31): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/[id]/reminders/route.ts(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/app/api/invoices/[id]/reminders/route.ts(8,35): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/[id]/reminders/route.ts(33,34): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/[id]/reminders/route.ts(57,34): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/[id]/reminders/route.ts(81,18): error TS2339: Property 'reminderSetting' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/[id]/route.ts(31,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/[id]/route.ts(115,19): error TS2339: Property 'tag' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/invoices/[id]/route.ts(119,23): error TS2339: Property 'type' does not exist on type 'TagFormData'.
src/app/api/invoices/[id]/route.ts(131,11): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/[id]/route.ts(141,11): error TS2353: Object literal may only specify known properties, and 'invoiceNumber' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/[id]/route.ts(148,38): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/api/invoices/[id]/route.ts(152,11): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/[id]/route.ts(165,29): error TS2339: Property 'items' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/route.ts(165,39): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/invoices/[id]/route.ts(170,37): error TS2339: Property 'purchaseOrder' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/route.ts(171,27): error TS2339: Property 'purchaseOrder' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/route.ts(172,37): error TS2339: Property 'purchaseOrder' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/route.ts(173,35): error TS2339: Property 'purchaseOrder' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/status/route.ts(9,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/invoices/[id]/status/route.ts(10,10): error TS2305: Module '"@/types/invoice"' has no exported member 'BankInfo'.
src/app/api/invoices/[id]/status/route.ts(37,9): error TS2353: Object literal may only specify known properties, and 'template' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/[id]/status/route.ts(56,11): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/[id]/status/route.ts(60,11): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/[id]/status/route.ts(67,16): error TS2339: Property 'statusHistory' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/invoices/[id]/status/route.ts(81,17): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/[id]/status/route.ts(83,17): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/[id]/status/route.ts(84,9): error TS2345: Argument of type '"invoiceStatusUpdated"' is not assignable to parameter of type 'MailTemplateType'.
src/app/api/invoices/[id]/status/route.ts(86,34): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/[id]/status/route.ts(87,31): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/__tests__/status-extension.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/invoices/__tests__/status-extension.test.ts(63,41): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(64,26): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(65,50): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(70,45): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(72,14): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(79,83): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(82,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(82,51): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(82,85): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(83,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(83,51): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(83,85): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(86,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(86,51): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(87,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(87,51): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(87,87): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(90,86): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(91,86): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status-extension.test.ts(94,12): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Record<InvoiceStatus, readonly InvoiceStatus[]>'.
src/app/api/invoices/__tests__/status-extension.test.ts(94,51): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(2,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/invoices/__tests__/status.test.ts(18,26): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/app/api/invoices/__tests__/status.test.ts(52,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(54,22): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/__tests__/status.test.ts(68,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(76,52): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(84,37): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(86,19): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/__tests__/status.test.ts(89,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/__tests__/status.test.ts(122,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/bulk/route.ts(33,13): error TS2353: Object literal may only specify known properties, and 'updatedById' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/send-email/route.ts(26,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/send-email/route.ts(51,37): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/send-email/route.ts(52,28): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/send-email/route.ts(53,17): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/send-email/route.ts(68,48): error TS2345: Argument of type '{ bankInfo: any; id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: $Enums.InvoiceStatus; totalAmount: Decimal; }' is not assignable to parameter of type 'InvoiceWithRelations'.
  Type '{ bankInfo: any; id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is missing the following properties from type 'InvoiceWithRelations': invoiceNumber, issueDate, dueDate, items
src/app/api/invoices/send-email/route.ts(71,11): error TS2554: Expected 3 arguments, but got 1.
src/app/api/invoices/send-email/route.ts(73,31): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/send-email/route.ts(74,24): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/send-email/route.ts(74,124): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/send-email/route.ts(77,40): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/upload/route.ts(7,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/invoices/upload/route.ts(8,33): error TS2305: Module '"@prisma/client"' has no exported member 'InvoiceItem'.
src/app/api/invoices/upload/route.ts(10,10): error TS2305: Module '"@/types/invoice"' has no exported member 'BankInfo'.
src/app/api/invoices/upload/route.ts(50,40): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/invoices/upload/route.ts(77,19): error TS2322: Type '"REJECTED"' is not assignable to type 'InvoiceStatus | NestedEnumInvoiceStatusFilter<"Invoice"> | undefined'.
src/app/api/invoices/upload/route.ts(105,9): error TS2353: Object literal may only specify known properties, and 'templateId' does not exist in type 'Without<InvoiceCreateInput, InvoiceUncheckedCreateInput> & InvoiceUncheckedCreateInput'.
src/app/api/invoices/upload/route.ts(108,31): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/invoices/upload/route.ts(117,43): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/invoices/upload/route.ts(127,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/upload/route.ts(138,9): error TS2353: Object literal may only specify known properties, and 'invoiceNumber' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/invoices/upload/route.ts(141,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/invoices/upload/route.ts(155,29): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/upload/route.ts(156,79): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/upload/route.ts(164,43): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/invoices/upload/route.ts(165,40): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/invoices/validation.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/invoices/validation.ts(23,40): error TS2339: Property 'registrationNumber' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/app/api/invoices/validation.ts(28,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/app/api/invoices/validation.ts(41,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/app/api/item-templates.ts(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'InvoiceTemplateItem'.
src/app/api/item-templates.ts(55,38): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/item-templates.ts(84,37): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/item-templates.ts(97,30): error TS2339: Property 'name' does not exist on type 'PurchaseOrderItem'.
src/app/api/item-templates.ts(132,20): error TS2339: Property 'invoiceTemplateItem' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/item-templates.ts(137,37): error TS2339: Property 'invoiceTemplate' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/item-templates.ts(150,30): error TS2339: Property 'name' does not exist on type 'PurchaseOrderItem'.
src/app/api/purchase-orders/[id]/route.ts(6,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/[id]/route.ts(24,40): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/[id]/route.ts(54,38): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/[id]/route.ts(94,36): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/[id]/send/route.ts(6,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/[id]/send/route.ts(22,40): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/[id]/send/route.ts(61,27): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/[id]/send/route.ts(70,36): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/[id]/status/route.ts(6,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/[id]/status/route.ts(9,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/purchase-orders/[id]/status/route.ts(43,36): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/[id]/status/route.ts(60,36): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/purchase-orders/[id]/status/route.ts(72,18): error TS2339: Property 'statusHistory' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/purchase-orders/[id]/status/route.ts(90,13): error TS2345: Argument of type '"statusUpdated"' is not assignable to parameter of type 'MailTemplateType'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(8,41): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(8,50): error TS2339: Property 'toBeDefined' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(9,48): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(9,57): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(10,41): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(10,57): error TS2551: Property 'toBeGreaterThan' does not exist on type 'Assertion'. Did you mean 'greaterThan'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(17,40): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(17,49): error TS2339: Property 'toBeDefined' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(18,47): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(18,56): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(19,40): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(19,56): error TS2551: Property 'toBeGreaterThan' does not exist on type 'Assertion'. Did you mean 'greaterThan'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(26,45): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(26,54): error TS2339: Property 'toBeDefined' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(27,59): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(27,69): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(34,38): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(34,58): error TS7006: Parameter 'toStatus' implicitly has an 'any' type.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(35,52): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(62,50): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(69,32): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(70,39): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(76,82): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/app/api/purchase-orders/__tests__/status-extension.test.ts(82,74): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(83,71): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(86,73): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(87,73): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(90,70): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status-extension.test.ts(91,70): error TS2551: Property 'toContain' does not exist on type 'Assertion'. Did you mean 'contain'?
src/app/api/purchase-orders/__tests__/status.test.ts(2,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/purchase-orders/__tests__/status.test.ts(5,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/__tests__/status.test.ts(18,26): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/app/api/purchase-orders/__tests__/status.test.ts(51,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(52,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(56,22): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(81,19): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(84,19): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(88,19): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(99,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(119,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(138,45): error TS2538: Type 'unknown' cannot be used as an index type.
src/app/api/purchase-orders/__tests__/status.test.ts(150,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(151,22): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(155,22): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/__tests__/status.test.ts(179,19): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/bulk/route.ts(6,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/purchase-orders/bulk/route.ts(85,41): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/bulk/route.ts(109,11): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/app/api/purchase-orders/bulk/route.ts(115,50): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/app/api/purchase-orders/bulk/route.ts(121,18): error TS2339: Property 'purchaseOrderItem' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/bulk/route.ts(124,18): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/bulk/route.ts(144,37): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/app/api/purchase-orders/bulk/route.ts(154,28): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/completed/route.ts(14,42): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/route.ts(6,18): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/route.ts(147,25): error TS2694: Namespace '"/Volumes/strage/opus_localdev/opus_comp/node_modules/.prisma/client/index".Prisma' has no exported member 'PurchaseOrderWhereInput'.
src/app/api/purchase-orders/route.ts(160,14): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/route.ts(161,14): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/purchase-orders/route.ts(173,56): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(179,46): error TS7006: Parameter 'history' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(236,39): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(236,44): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(249,30): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/purchase-orders/route.ts(269,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(281,30): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(367,37): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(367,42): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(379,30): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/purchase-orders/route.ts(400,33): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/api/purchase-orders/route.ts(463,16): error TS2339: Property 'purchaseOrder' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/purchase-orders/validation.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/purchase-orders/validation.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/purchase-orders/validation.ts(16,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(17,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(18,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(19,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(21,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(22,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(23,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(24,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(26,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(27,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(28,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(29,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(53,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(66,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/app/api/purchase-orders/validation.ts(80,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/app/api/reminders/__tests__/route.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/reminders/__tests__/route.test.ts(2,34): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/reminders/__tests__/route.test.ts(6,10): error TS2305: Module '"@/lib/mail"' has no exported member 'mailService'.
src/app/api/reminders/__tests__/route.test.ts(25,31): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/__tests__/route.test.ts(49,31): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/__tests__/route.test.ts(75,31): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/__tests__/route.test.ts(90,39): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/__tests__/route.test.ts(106,31): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/__tests__/route.test.ts(126,31): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(2,34): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/api/reminders/route.ts(5,10): error TS2305: Module '"@/lib/mail"' has no exported member 'mailService'.
src/app/api/reminders/route.ts(19,29): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(20,7): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/app/api/reminders/route.ts(32,29): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(33,7): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/app/api/reminders/route.ts(45,29): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(46,7): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/app/api/reminders/route.ts(57,18): error TS2339: Property 'reminderLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/reminders/route.ts(68,17): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(70,21): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(72,26): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(80,17): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(82,21): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(84,26): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(95,37): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(99,18): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/reminders/route.ts(102,31): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/app/api/reminders/route.ts(110,17): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(112,21): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/reminders/route.ts(114,26): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/app/api/tags/[id]/route.ts(34,21): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/[id]/route.ts(56,30): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/[id]/route.ts(96,14): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/[id]/route.ts(114,37): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/[id]/route.ts(183,33): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/[id]/route.ts(185,34): error TS2694: Namespace '"/Volumes/strage/opus_localdev/opus_comp/node_modules/.prisma/client/index".Prisma' has no exported member 'TagUpdateInput'.
src/app/api/tags/__tests__/tags.test.ts(1,61): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/app/api/tags/__tests__/tags.test.ts(7,18): error TS2305: Module '"@prisma/client"' has no exported member 'Tag'.
src/app/api/tags/__tests__/tags.test.ts(7,47): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/api/tags/__tests__/tags.test.ts(37,31): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/__tests__/tags.test.ts(46,18): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/__tests__/tags.test.ts(111,39): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/__tests__/tags.test.ts(134,15): error TS2353: Object literal may only specify known properties, and 'category' does not exist in type 'Without<VendorUncheckedCreateWithoutInvoicesInput, VendorCreateWithoutInvoicesInput> & VendorCreateWithoutInvoicesInput'.
src/app/api/tags/__tests__/tags.test.ts(166,11): error TS2353: Object literal may only specify known properties, and 'invoiceNumber' does not exist in type 'InvoiceWhereInput'.
src/app/api/tags/__tests__/tags.test.ts(194,11): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/tags/__tests__/tags.test.ts(198,30): error TS2339: Property 'tags' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/tags/__tests__/tags.test.ts(198,40): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/api/tags/__tests__/tags.test.ts(206,11): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type '(Without<InvoiceUpdateInput, InvoiceUncheckedUpdateInput> & InvoiceUncheckedUpdateInput) | (Without<...> & InvoiceUpdateInput)'.
src/app/api/tags/__tests__/tags.test.ts(232,11): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/api/tags/__tests__/tags.test.ts(236,30): error TS2339: Property 'tags' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/api/tags/__tests__/tags.test.ts(236,40): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/api/tags/route.ts(11,31): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/route.ts(31,30): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/route.ts(52,18): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/tags/seed-business-types/route.ts(36,16): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/test/setup-user/route.ts(3,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/app/api/vendors/[id]/route.ts(23,13): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'UserSelect<DefaultArgs>'.
src/app/api/vendors/[id]/route.ts(77,19): error TS2339: Property 'tag' does not exist on type 'Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">'.
src/app/api/vendors/[id]/route.ts(92,11): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type '(Without<VendorUpdateInput, VendorUncheckedUpdateInput> & VendorUncheckedUpdateInput) | (Without<...> & VendorUpdateInput)'.
src/app/api/vendors/[id]/route.ts(103,11): error TS2353: Object literal may only specify known properties, and 'category' does not exist in type '(Without<VendorUpdateInput, VendorUncheckedUpdateInput> & VendorUncheckedUpdateInput) | (Without<...> & VendorUpdateInput)'.
src/app/api/vendors/[id]/route.ts(113,38): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/api/vendors/[id]/route.ts(119,15): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'UserSelect<DefaultArgs>'.
src/app/api/vendors/bulk/route.ts(7,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/app/api/vendors/bulk/route.ts(8,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/vendors/bulk/route.ts(9,18): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/app/api/vendors/bulk/route.ts(85,21): error TS2352: Conversion of type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }[]' to type 'VendorWithPurchaseOrders[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }' is missing the following properties from type 'VendorWithPurchaseOrders': status, purchaseOrders
src/app/api/vendors/bulk/route.ts(91,9): error TS2353: Object literal may only specify known properties, and 'purchaseOrders' does not exist in type 'VendorInclude<DefaultArgs>'.
src/app/api/vendors/bulk/route.ts(158,19): error TS2353: Object literal may only specify known properties, and 'status' does not exist in type '(Without<VendorUpdateInput, VendorUncheckedUpdateInput> & VendorUncheckedUpdateInput) | (Without<...> & VendorUpdateInput)'.
src/app/api/vendors/tags/route.ts(15,31): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/vendors/tags/route.ts(42,30): error TS2339: Property 'tag' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/api/vendors/validation.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/app/api/vendors/validation.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/app/api/vendors/validation.ts(2,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/app/api/vendors/validation.ts(24,40): error TS2339: Property 'registrationNumber' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/app/auth/error/page.tsx(24,15): error TS2322: Type '{ children: string; onClick: () => void; variant: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/app/auth/error/page.tsx(29,23): error TS2322: Type '{ children: string; variant: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/app/dashboard/payments.tsx(9,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/dashboard/payments.tsx(10,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/app/dashboard/payments.tsx(11,10): error TS2305: Module '"@prisma/client"' has no exported member 'PaymentMethod'.
src/app/dashboard/payments.tsx(14,11): error TS2430: Interface 'ExtendedInvoice' incorrectly extends interface 'Omit<Invoice, "vendor">'.
  Types of property 'totalAmount' are incompatible.
    Type 'Decimal' is not assignable to type 'number'.
src/app/dashboard/payments.tsx(103,12): error TS2678: Type '"PAID"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments.tsx(105,12): error TS2678: Type '"OVERDUE"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments.tsx(107,12): error TS2678: Type '"PENDING"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments.tsx(109,12): error TS2678: Type '"REVIEWING"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments.tsx(113,12): error TS2678: Type '"REJECTED"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments.tsx(330,52): error TS2367: This comparison appears to be unintentional because the types '"DRAFT" | "APPROVED"' and '"PAID"' have no overlap.
src/app/dashboard/payments.tsx(337,76): error TS2367: This comparison appears to be unintentional because the types '"DRAFT" | "APPROVED"' and '"PAID"' have no overlap.
src/app/dashboard/payments.tsx(365,26): error TS2367: This comparison appears to be unintentional because the types '"DRAFT" | "APPROVED"' and '"PAID"' have no overlap.
src/app/dashboard/payments.tsx(380,34): error TS2339: Property 'invoiceNumber' does not exist on type 'ExtendedInvoice'.
src/app/dashboard/payments.tsx(389,50): error TS2339: Property 'dueDate' does not exist on type 'ExtendedInvoice'.
src/app/dashboard/payments/[id].tsx(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/dashboard/payments/[id].tsx(5,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/app/dashboard/payments/[id].tsx(6,42): error TS2305: Module '"@prisma/client"' has no exported member 'PaymentMethod'.
src/app/dashboard/payments/[id].tsx(263,10): error TS2367: This comparison appears to be unintentional because the types 'InvoiceStatus' and '"PAID"' have no overlap.
src/app/dashboard/payments/[id].tsx(293,10): error TS2678: Type '"PAID"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments/[id].tsx(295,10): error TS2678: Type '"OVERDUE"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments/[id].tsx(297,10): error TS2678: Type '"PENDING"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments/[id].tsx(299,10): error TS2678: Type '"REVIEWING"' is not comparable to type 'InvoiceStatus'.
src/app/dashboard/payments/[id].tsx(303,10): error TS2678: Type '"REJECTED"' is not comparable to type 'InvoiceStatus'.
src/app/invoices/[id].tsx(5,37): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/app/invoices/[id].tsx(6,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/app/invoices/[id].tsx(6,27): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceItem'.
src/app/invoices/[id].tsx(9,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/app/invoices/[id].tsx(10,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/app/invoices/[id]/page.tsx(20,36): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/invoices/[id]/page.tsx(36,9): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/invoices/[id]/page.tsx(54,22): error TS2339: Property 'items' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/invoices/[id]/page.tsx(54,32): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/invoices/[id]/page.tsx(60,32): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/invoices/[id]/page.tsx(61,30): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/invoices/[id]/page.tsx(62,19): error TS2339: Property 'bankInfo' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/app/purchase-orders/[id]/edit/layout.tsx(22,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorSelect<DefaultArgs>'.
src/app/purchase-orders/[id]/edit/layout.tsx(25,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorOrderByWithRelationInput | VendorOrderByWithRelationInput[]'.
src/app/purchase-orders/[id]/edit/page.tsx(7,10): error TS2305: Module '"@/components/purchase-orders/PurchaseOrderForm"' has no exported member 'PurchaseOrderFormDataWithRHF'.
src/app/purchase-orders/[id]/edit/page.tsx(26,38): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/purchase-orders/[id]/edit/page.tsx(47,7): error TS2353: Object literal may only specify known properties, and 'status' does not exist in type 'VendorWhereInput'.
src/app/purchase-orders/[id]/edit/page.tsx(52,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorSelect<DefaultArgs>'.
src/app/purchase-orders/[id]/edit/page.tsx(55,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorOrderByWithRelationInput | VendorOrderByWithRelationInput[]'.
src/app/purchase-orders/[id]/edit/page.tsx(65,36): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/purchase-orders/[id]/edit/page.tsx(76,34): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/app/purchase-orders/[id]/edit/page.tsx(93,19): error TS2339: Property 'code' does not exist on type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }'.
src/app/purchase-orders/[id]/page.tsx(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/purchase-orders/[id]/page.tsx(16,38): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/purchase-orders/[id]/page.tsx(59,36): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/purchase-orders/[id]/page.tsx(65,52): error TS7006: Parameter 'history' implicitly has an 'any' type.
src/app/purchase-orders/new/layout.tsx(22,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorSelect<DefaultArgs>'.
src/app/purchase-orders/new/layout.tsx(25,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorOrderByWithRelationInput | VendorOrderByWithRelationInput[]'.
src/app/purchase-orders/new/page.tsx(11,7): error TS2353: Object literal may only specify known properties, and 'status' does not exist in type 'VendorWhereInput'.
src/app/purchase-orders/new/page.tsx(16,7): error TS2353: Object literal may only specify known properties, and 'code' does not exist in type 'VendorSelect<DefaultArgs>'.
src/app/purchase-orders/new/page.tsx(35,9): error TS2322: Type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }[]' is not assignable to type 'Vendor[]'.
  Property 'code' is missing in type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }' but required in type 'Vendor'.
src/app/purchase-orders/page.tsx(7,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/app/purchase-orders/page.tsx(16,39): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/app/purchase-orders/page.tsx(46,54): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/app/purchase-orders/page.tsx(50,28): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/app/purchase-orders/page.tsx(56,44): error TS7006: Parameter 'history' implicitly has an 'any' type.
src/app/vendor-portal/page.tsx(17,7): error TS2353: Object literal may only specify known properties, and 'users' does not exist in type 'VendorWhereInput'.
src/app/vendor-portal/page.tsx(24,7): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type 'VendorInclude<DefaultArgs>'.
src/app/vendor-portal/page.tsx(47,7): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/app/vendor-portal/page.tsx(58,9): error TS2322: Type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }[]' is not assignable to type 'Invoice[]'.
  Property 'vendor' is missing in type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' but required in type 'Invoice'.
src/app/vendors/[id]/page.tsx(4,10): error TS2305: Module '"@/types/vendor"' has no exported member 'ExtendedVendor'.
src/app/vendors/[id]/page.tsx(17,7): error TS2353: Object literal may only specify known properties, and 'tags' does not exist in type 'VendorInclude<DefaultArgs>'.
src/app/vendors/[id]/page.tsx(28,18): error TS2339: Property 'tags' does not exist on type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }'.
src/app/vendors/[id]/page.tsx(28,27): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/components/auth/schemas/signinSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/auth/schemas/signupSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/auth/schemas/signupSchema.ts(16,12): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/auth/signin-form.tsx(6,39): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/auth/signin-form.tsx(7,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/auth/signin-form.tsx(116,15): error TS2322: Type '{ children: string; onClick: () => void; variant: string; className: string; "aria-label": string; "data-testid": string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/auth/signup-form.tsx(6,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/auth/signup-form.tsx(7,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/auth/signup-form.tsx(169,11): error TS2322: Type '{ children: string; onClick: () => void; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/common/__tests__/Tag.test.tsx(1,23): error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
src/components/common/__tests__/Tag.test.tsx(3,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/common/__tests__/Tag.test.tsx(4,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/common/__tests__/TagInput.test.tsx(1,23): error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
src/components/common/__tests__/TagInput.test.tsx(3,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/common/__tests__/TagInput.test.tsx(4,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/common/__tests__/TagInput.test.tsx(5,23): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/components/common/__tests__/TagManager.test.tsx(1,23): error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
src/components/common/__tests__/TagManager.test.tsx(3,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/common/__tests__/TagManager.test.tsx(4,23): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/components/common/__tests__/TagManager.test.tsx(7,59): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/common/Tag.tsx(3,27): error TS2307: Cannot find module '@heroicons/react/24/outline' or its corresponding type declarations.
src/components/common/Tag.tsx(5,18): error TS2307: Cannot find module 'clsx' or its corresponding type declarations.
src/components/common/TagInput.tsx(5,37): error TS2307: Cannot find module '@heroicons/react/24/outline' or its corresponding type declarations.
src/components/common/TagInput.tsx(9,18): error TS2307: Cannot find module 'clsx' or its corresponding type declarations.
src/components/common/TagManager.tsx(7,25): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/common/TagManager.tsx(99,31): error TS2322: Type '{ children: (string | false | Element)[]; key: string | undefined; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & BadgeProps'.
src/components/common/TagManager.tsx(103,17): error TS2322: Type '{ children: Element; variant: string; size: string; className: string; onClick: () => void; "aria-label": string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/common/TagManager.tsx(106,45): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/common/TagManager.tsx(126,17): error TS2322: Type '{ children: (string | Element)[]; type: "button"; variant: string; className: string; onClick: () => Promise<void>; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/dashboard/alert-list.tsx(3,26): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/components/dashboard/alert-list.tsx(4,50): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/dashboard/alert-list.tsx(38,20): error TS7006: Parameter 'alert' implicitly has an 'any' type.
src/components/dashboard/payment-calendar.tsx(3,26): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/components/dashboard/payment-calendar.tsx(4,33): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/dashboard/payment-calendar.tsx(5,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/dashboard/payment-calendar.tsx(27,22): error TS7006: Parameter 'payment' implicitly has an 'any' type.
src/components/dashboard/progress-tracker.tsx(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/dashboard/recent-orders.tsx(3,26): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/components/dashboard/recent-orders.tsx(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/dashboard/recent-orders.tsx(5,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/dashboard/recent-orders.tsx(27,20): error TS7006: Parameter 'order' implicitly has an 'any' type.
src/components/dashboard/status-summary.tsx(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/dashboard/status-summary.tsx(36,29): error TS2538: Type 'unknown' cannot be used as an index type.
src/components/dashboard/VendorPortalDashboard.tsx(6,52): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/dashboard/VendorPortalDashboard.tsx(21,62): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/dashboard/VendorPortalDashboard.tsx(23,59): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/dashboard/VendorPortalDashboard.tsx(105,56): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/components/dashboard/VendorPortalDashboard.tsx(107,41): error TS2339: Property 'issueDate' does not exist on type 'Invoice'.
src/components/dashboard/VendorPortalDashboard.tsx(114,62): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/dashboard/VendorPortalDashboard.tsx(118,62): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/dashboard/VendorPortalDashboard.tsx(127,33): error TS2322: Type '{ children: string; variant: string; size: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/forms/__tests__/FormError.test.tsx(1,32): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/forms/__tests__/FormError.test.tsx(2,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/forms/__tests__/ItemCategorySelect.test.tsx(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/forms/__tests__/ItemCategorySelect.test.tsx(2,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/forms/__tests__/ItemCategorySelect.test.tsx(3,39): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/forms/__tests__/OrderItemsTable.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/forms/__tests__/OrderItemsTable.test.tsx(2,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/forms/__tests__/OrderItemsTable.test.tsx(143,20): error TS7006: Parameter 'input' implicitly has an 'any' type.
src/components/forms/__tests__/TaxRateSelect.test.tsx(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/forms/__tests__/TaxRateSelect.test.tsx(2,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/forms/__tests__/TaxRateSelect.test.tsx(3,39): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/forms/FormError.tsx(3,29): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/forms/hooks/__tests__/useItemList.test.ts(1,33): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/forms/hooks/__tests__/useItemList.test.ts(32,34): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/components/forms/hooks/__tests__/useItemList.test.ts(46,34): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/components/forms/hooks/__tests__/useItemList.test.ts(47,27): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/components/forms/hooks/__tests__/useItemList.test.ts(61,34): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/components/forms/hooks/__tests__/useItemList.test.ts(62,27): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/components/forms/hooks/__tests__/useItemList.test.ts(78,37): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/components/forms/hooks/__tests__/useItemList.test.ts(79,27): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/components/forms/hooks/__tests__/useItemList.test.ts(90,21): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/components/forms/hooks/__tests__/useItemList.test.ts(106,48): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/components/forms/hooks/__tests__/useItemList.test.ts(109,49): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/components/forms/hooks/__tests__/useItemList.test.ts(112,45): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/components/forms/ItemCategorySelect.tsx(11,32): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/forms/ItemCategorySelect.tsx(41,18): error TS7031: Binding element 'field' implicitly has an 'any' type.
src/components/forms/OrderItemsTable.tsx(4,32): error TS2307: Cannot find module '@tanstack/react-virtual' or its corresponding type declarations.
src/components/forms/OrderItemsTable.tsx(10,30): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/forms/OrderItemsTable.tsx(11,22): error TS7016: Could not find a declaration file for module 'lodash/debounce'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/lodash/debounce.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/lodash` if it exists or add a new declaration (.d.ts) file containing `declare module 'lodash/debounce';`
src/components/forms/OrderItemsTable.tsx(114,33): error TS7006: Parameter 'virtualRow' implicitly has an 'any' type.
src/components/forms/OrderItemsTable.tsx(206,27): error TS2322: Type '{ children: Element; type: "button"; variant: string; size: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/forms/OrderItemsTable.tsx(224,33): error TS2322: Type '{ children: (string | Element)[]; type: "button"; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/forms/schemas/orderSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/forms/schemas/orderSchema.ts(2,25): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/forms/schemas/orderSchema.ts(64,11): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/forms/schemas/orderSchema.ts(89,11): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/forms/TaxRateSelect.tsx(11,32): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/forms/TaxRateSelect.tsx(35,18): error TS7031: Binding element 'field' implicitly has an 'any' type.
src/components/forms/TaxRateSelect.tsx(41,31): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/invoice/__tests__/InvoiceForm.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/invoice/__tests__/InvoiceForm.test.tsx(2,23): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/components/invoice/__tests__/InvoiceForm.test.tsx(3,28): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/invoice/__tests__/InvoiceForm.test.tsx(13,3): error TS2322: Type '"DRAFT"' is not assignable to type 'InvoiceStatus'.
src/components/invoice/__tests__/InvoiceForm.test.tsx(21,7): error TS2322: Type 'number' is not assignable to type 'MonetaryAmount'.
src/components/invoice/__tests__/InvoiceForm.test.tsx(35,10): error TS2741: Property 'id' is missing in type '{ name: string; }' but required in type 'Tag'.
src/components/invoice/__tests__/InvoiceForm.test.tsx(128,9): error TS2322: Type 'number' is not assignable to type 'MonetaryAmount'.
src/components/invoice/__tests__/InvoicePdfButton.test.tsx(1,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/invoice/__tests__/InvoicePdfButton.test.tsx(2,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/invoice/__tests__/InvoicePdfButton.test.tsx(4,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/components/invoice/__tests__/InvoicePdfButton.test.tsx(5,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/invoice/__tests__/InvoicePdfButton.test.tsx(5,24): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/invoice/__tests__/InvoicePreviewModal.test.tsx(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/invoice/__tests__/InvoicePreviewModal.test.tsx(2,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/invoice/__tests__/InvoicePreviewModal.test.tsx(6,27): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/invoice/__tests__/InvoicePreviewModal.test.tsx(47,36): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/CreateInvoiceButton.tsx(6,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/invoice/InvoiceDetail.tsx(3,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/components/invoice/InvoiceDetail.tsx(40,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoiceDetail.tsx(40,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/invoice/InvoiceEmailButton.tsx(22,29): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/components/invoice/InvoiceEmailButton.tsx(23,139): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/components/invoice/InvoiceEmailButton.tsx(23,236): error TS2339: Property 'dueDate' does not exist on type 'Invoice'.
src/components/invoice/InvoiceEmailButton.tsx(64,9): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceEmailButton.tsx(114,17): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceEmailDialog.tsx(17,10): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoiceEmailDialog.tsx(18,22): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/invoice/InvoiceEmailDialog.tsx(74,17): error TS2322: Type '{ children: (string | Element)[]; variant: string; size: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceEmailDialog.tsx(123,35): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceFilters.tsx(71,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/invoice/InvoiceForm.tsx(3,39): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/invoice/InvoiceForm.tsx(4,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/invoice/InvoiceForm.tsx(5,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/invoice/InvoiceForm.tsx(21,27): error TS2724: '"@/types/view/invoice"' has no exported member named 'ViewInvoiceFormInput'. Did you mean 'ViewInvoiceForm'?
src/components/invoice/InvoiceForm.tsx(26,26): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceForm.tsx(28,26): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceForm.tsx(29,26): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceForm.tsx(43,40): error TS2339: Property 'registrationNumber' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/invoice/InvoiceItemsForm.tsx(3,70): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/invoice/InvoiceItemsForm.tsx(35,20): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/invoice/InvoiceItemsForm.tsx(35,27): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/invoice/InvoiceItemsForm.tsx(82,17): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => any; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceItemsForm.tsx(95,11): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => any; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceList.tsx(4,10): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoiceListItem.tsx(5,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/components/invoice/InvoiceListItem.tsx(5,27): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoiceListItem.tsx(9,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/invoice/InvoiceListItem.tsx(33,13): error TS2322: Type '{ children: string; variant: string; size: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceListItem.tsx(41,21): error TS2322: Type '{ children: string; variant: string; size: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceListItem.tsx(47,15): error TS2322: Type '{ children: string; variant: string; size: string; onClick: () => Promise<void>; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceListItem.tsx(49,57): error TS2345: Argument of type '"PAID"' is not assignable to parameter of type 'InvoiceStatus'.
src/components/invoice/InvoiceListWrapper.tsx(6,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/components/invoice/InvoiceListWrapper.tsx(6,27): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoiceListWrapper.tsx(49,13): error TS2322: Type 'InvoiceStatus | null' is not assignable to type 'InvoiceStatus'.
  Type 'null' is not assignable to type 'InvoiceStatus'.
src/components/invoice/InvoiceManagement.tsx(5,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/invoice/InvoiceManagement.tsx(6,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/invoice/InvoiceManagement.tsx(249,13): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePageHeader.tsx(4,36): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/invoice/InvoicePageHeader.tsx(6,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/components/invoice/InvoicePageHeader.tsx(6,27): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoicePageHeader.tsx(9,24): error TS2307: Cannot find module 'framer-motion' or its corresponding type declarations.
src/components/invoice/InvoicePageHeader.tsx(43,13): error TS2322: Type '{ children: Element[]; variant: string; onClick: () => void; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePageHeader.tsx(71,17): error TS2322: Type '{ children: (string | Element)[]; variant: string; size: string; onClick: (() => void) | undefined; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePageHeader.tsx(101,59): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/components/invoice/InvoicePageHeader.tsx(101,64): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePageHeader.tsx(128,59): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/components/invoice/InvoicePageHeader.tsx(128,64): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePageHeader.tsx(145,15): error TS2322: Type '{ children: string; variant: string; size: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePDF.tsx(4,62): error TS2307: Cannot find module '@react-pdf/renderer' or its corresponding type declarations.
src/components/invoice/InvoicePDF.tsx(85,28): error TS2339: Property 'items' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(85,42): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(85,47): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(88,28): error TS2339: Property 'items' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(88,42): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(88,47): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(93,28): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(93,78): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(101,33): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(102,31): error TS2339: Property 'issueDate' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(103,32): error TS2339: Property 'dueDate' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(109,39): error TS2339: Property 'registrationNumber' does not exist on type '{ name: string; email: string; }'.
src/components/invoice/InvoicePDF.tsx(110,37): error TS2339: Property 'address' does not exist on type '{ name: string; email: string; }'.
src/components/invoice/InvoicePDF.tsx(122,20): error TS2339: Property 'items' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(122,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(122,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/invoice/InvoicePDF.tsx(165,18): error TS2339: Property 'notes' does not exist on type 'Invoice'.
src/components/invoice/InvoicePDF.tsx(167,53): error TS2339: Property 'notes' does not exist on type 'Invoice'.
src/components/invoice/InvoicePdfButton.tsx(5,62): error TS2307: Cannot find module '@react-pdf/renderer' or its corresponding type declarations.
src/components/invoice/InvoicePdfButton.tsx(6,30): error TS2307: Cannot find module '@react-pdf/renderer' or its corresponding type declarations.
src/components/invoice/InvoicePdfButton.tsx(8,10): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoicePdfButton.tsx(146,26): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(146,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(153,51): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(201,31): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(201,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(273,11): error TS7031: Binding element 'url' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(273,16): error TS7031: Binding element 'loading' implicitly has an 'any' type.
src/components/invoice/InvoicePdfButton.tsx(273,25): error TS7031: Binding element 'error' implicitly has an 'any' type.
src/components/invoice/InvoicePreview.tsx(6,10): error TS2305: Module '"@/types/invoice"' has no exported member 'SerializedInvoice'.
src/components/invoice/InvoicePreview.tsx(65,37): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/invoice/InvoicePreview.tsx(65,43): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/invoice/InvoicePreviewModal.tsx(10,44): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/invoice/InvoicePreviewModal.tsx(15,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/components/invoice/InvoicePreviewModal.tsx(173,13): error TS2322: Type '{ children: (string | Element)[]; variant: string; onClick: () => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePreviewModal.tsx(181,13): error TS2322: Type '{ children: (string | Element)[]; variant: string; onClick: () => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePreviewModal.tsx(189,17): error TS2322: Type '{ children: string; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePrintPreview.tsx(5,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/components/invoice/InvoicePrintPreview.tsx(7,30): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/invoice/InvoicePrintPreview.tsx(8,24): error TS2307: Cannot find module 'framer-motion' or its corresponding type declarations.
src/components/invoice/InvoicePrintPreview.tsx(21,19): error TS2322: Type '{ children: (string | Element)[]; variant: string; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoicePrintPreview.tsx(31,21): error TS2322: Type '{ children: (string | Element)[]; variant: string; size: string; onClick: () => void; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceStatusBadge.tsx(6,24): error TS2307: Cannot find module 'framer-motion' or its corresponding type declarations.
src/components/invoice/InvoiceStatusBadge.tsx(18,24): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceStatusBadge.tsx(22,24): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceStatusBadge.tsx(24,24): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceStatusBadge.tsx(26,24): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/components/invoice/InvoiceStatusHistory.tsx(3,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/invoice/InvoiceTemplateDialog.tsx(4,10): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceTemplate'.
src/components/invoice/InvoiceTemplateDialog.tsx(4,27): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceTemplateWithParsedBankInfo'.
src/components/invoice/InvoiceTemplateDialog.tsx(4,62): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceTemplateItem'.
src/components/invoice/InvoiceTemplateDialog.tsx(72,17): error TS2322: Type '{ children: string; variant: string; type: "button"; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceTemplateDialog.tsx(83,15): error TS2322: Type '{ children: string; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceTemplateDialog.tsx(89,15): error TS2322: Type '{ children: string; variant: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/InvoiceUploadForm.tsx(3,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/invoice/InvoiceUploadForm.tsx(4,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/invoice/InvoiceUploadForm.tsx(5,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/invoice/ReminderSettings.tsx(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/components/invoice/ReminderSettings.tsx(149,33): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/invoice/ReminderSettings.tsx(174,37): error TS7006: Parameter 'checked' implicitly has an 'any' type.
src/components/invoice/ReminderSettings.tsx(179,19): error TS2322: Type '{ children: string; variant: string; size: string; onClick: () => Promise<void>; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/invoice/schemas/invoiceSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/invoice/types.ts(1,10): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceItem'.
src/components/InvoiceTemplate.tsx(2,10): error TS2305: Module '"@/domains/invoice/tax"' has no exported member 'calculateTaxByRate'.
src/components/InvoiceTemplate.tsx(93,33): error TS7006: Parameter 'tax' implicitly has an 'any' type.
src/components/ItemTemplateSelector.tsx(2,33): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/ItemTemplateSelector.tsx(41,18): error TS2339: Property 'name' does not exist on type 'PurchaseOrderItem'.
src/components/layouts/Header.tsx(6,36): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/layouts/Header.tsx(41,23): error TS2322: Type '{ children: Element; variant: string; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/layouts/Header.tsx(49,23): error TS2322: Type '{ children: Element; variant: string; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/layouts/Header.tsx(54,27): error TS2322: Type '{ children: Element[]; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/layouts/Sidebar.tsx(12,8): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/orders/OrderForm.tsx(4,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/orders/OrderForm.tsx(5,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/orders/OrderForm.tsx(6,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/orders/OrderForm.tsx(9,10): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'commonValidation'.
src/components/orders/OrderItemsForm.tsx(4,56): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/orders/OrderItemsForm.tsx(45,22): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/orders/OrderItemsForm.tsx(45,29): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/purchase-orders/__tests__/PurchaseOrderForm.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/purchase-orders/__tests__/PurchaseOrderForm.test.tsx(2,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(1,32): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(9,85): error TS2339: Property 'toBeInTheDocument' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(14,85): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(17,87): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(20,84): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(23,89): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(26,88): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/__tests__/StatusBadge.test.tsx(29,87): error TS2339: Property 'toHaveClass' does not exist on type 'Assertion'.
src/components/purchase-orders/ItemsTable.tsx(1,37): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetail.tsx(5,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/components/purchase-orders/PurchaseOrderDetail.tsx(5,33): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderItem'.
src/components/purchase-orders/PurchaseOrderDetail.tsx(5,52): error TS2305: Module '"@prisma/client"' has no exported member 'StatusHistory'.
src/components/purchase-orders/PurchaseOrderDetail.tsx(6,40): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetail.tsx(10,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetail.tsx(11,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetail.tsx(137,38): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/purchase-orders/PurchaseOrderDetailView.tsx(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/purchase-orders/PurchaseOrderDetailView.tsx(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetailView.tsx(5,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetailView.tsx(6,42): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderDetailView.tsx(120,17): error TS2322: Type '{ children: (string | Element)[]; variant: string; onClick: () => Promise<void>; disabled: boolean; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/purchase-orders/PurchaseOrderForm.tsx(3,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderForm.tsx(4,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderForm.tsx(97,35): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(3,70): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(7,30): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(10,8): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'Item'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(33,20): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(33,27): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(60,66): error TS2339: Property 'positiveNumber' does not exist on type '{ readonly required: "必須項目です"; readonly invalidFormat: "無効な形式です"; readonly arrayMinLength: "1つ以上の項目が必要です"; readonly invalidDate: "無効な日付です"; readonly invalidEmail: "無効なメールアドレスです"; ... 4 more ...; readonly invalidPhone: "無効な電話番号です"; }'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(78,66): error TS2339: Property 'nonNegativeNumber' does not exist on type '{ readonly required: "必須項目です"; readonly invalidFormat: "無効な形式です"; readonly arrayMinLength: "1つ以上の項目が必要です"; readonly invalidDate: "無効な日付です"; readonly invalidEmail: "無効なメールアドレスです"; ... 4 more ...; readonly invalidPhone: "無効な電話番号です"; }'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(96,68): error TS2339: Property 'taxRateMin' does not exist on type '{ readonly required: "必須項目です"; readonly invalidFormat: "無効な形式です"; readonly arrayMinLength: "1つ以上の項目が必要です"; readonly invalidDate: "無効な日付です"; readonly invalidEmail: "無効なメールアドレスです"; ... 4 more ...; readonly invalidPhone: "無効な電話番号です"; }'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(97,66): error TS2339: Property 'taxRateMax' does not exist on type '{ readonly required: "必須項目です"; readonly invalidFormat: "無効な形式です"; readonly arrayMinLength: "1つ以上の項目が必要です"; readonly invalidDate: "無効な日付です"; readonly invalidEmail: "無効なメールアドレスです"; ... 4 more ...; readonly invalidPhone: "無効な電話番号です"; }'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(122,15): error TS2322: Type '{ children: Element; type: "button"; variant: string; size: string; onClick: () => any; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/purchase-orders/PurchaseOrderItemsForm.tsx(136,11): error TS2322: Type '{ children: (string | Element)[]; type: "button"; variant: string; onClick: () => any; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/purchase-orders/PurchaseOrderList.tsx(5,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/purchase-orders/PurchaseOrderList.tsx(7,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderList.tsx(8,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/purchase-orders/PurchaseOrderList.tsx(9,22): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/purchase-orders/schemas/__tests__/purchaseOrderSchema.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/purchase-orders/schemas/__tests__/purchaseOrderSchema.test.ts(2,31): error TS2305: Module '"../purchaseOrderSchema"' has no exported member 'DEPARTMENT_LIMITS'.
src/components/purchase-orders/schemas/__tests__/purchaseOrderSchema.test.ts(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(18,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(19,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(20,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(21,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(23,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(24,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(25,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(26,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(28,30): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(29,48): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(30,13): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(31,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(66,11): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/purchase-orders/schemas/purchaseOrderSchema.ts(72,11): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/PurchaseOrderItems.tsx(2,74): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/PurchaseOrderItems.tsx(3,55): error TS2307: Cannot find module 'react-beautiful-dnd' or its corresponding type declarations.
src/components/PurchaseOrderItems.tsx(94,13): error TS7006: Parameter 'provided' implicitly has an 'any' type.
src/components/PurchaseOrderItems.tsx(96,28): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/PurchaseOrderItems.tsx(96,35): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/PurchaseOrderItems.tsx(102,21): error TS7006: Parameter 'provided' implicitly has an 'any' type.
src/components/PurchaseOrderItems.tsx(102,31): error TS7006: Parameter 'snapshot' implicitly has an 'any' type.
src/components/RegisterPaymentModal.tsx(2,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/RegisterPaymentModal.tsx(3,10): error TS2305: Module '"@prisma/client"' has no exported member 'PaymentMethod'.
src/components/ReminderSettings.tsx(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/components/settings/TagSettings.tsx(4,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/BaseForm.tsx(4,67): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/BaseForm.tsx(5,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/shared/form/BaseForm.tsx(6,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/form/BaseFormWrapper.tsx(2,58): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/BaseFormWrapper.tsx(35,15): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/shared/form/DateField.tsx(3,59): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/DateField.tsx(6,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/shared/form/FormField.tsx(4,67): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/FormField.tsx(34,18): error TS7031: Binding element 'field' implicitly has an 'any' type.
src/components/shared/form/FormField.types.ts(1,44): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/FormLayout.tsx(45,13): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => void; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/shared/form/InputField.tsx(3,44): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/OrderItemsForm.tsx(3,98): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/OrderItemsForm.tsx(9,36): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/shared/form/OrderItemsForm.tsx(101,26): error TS7006: Parameter 'total' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(101,33): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(109,26): error TS7006: Parameter 'total' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(109,33): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(117,26): error TS7006: Parameter 'total' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(117,33): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(126,22): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(126,29): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/shared/form/OrderItemsForm.tsx(188,19): error TS2322: Type '{ children: Element; type: "button"; variant: string; size: string; onClick: () => any; className: string; "data-cy": string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/shared/form/OrderItemsForm.tsx(205,11): error TS2322: Type '{ children: (string | Element)[]; type: "button"; variant: string; onClick: () => void; className: string; "data-cy": string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/shared/form/schemas/commonSchema.ts(7,8): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'Tag'.
src/components/shared/form/schemas/commonSchema.ts(8,8): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'BankInfo'.
src/components/shared/form/schemas/commonSchema.ts(9,8): error TS2305: Module '"@/types/validation/commonValidation"' has no exported member 'Item'.
src/components/shared/form/schemas/commonSchema.ts(24,40): error TS2339: Property 'amount' does not exist on type '{ required: any; optional: any; }'.
src/components/shared/form/schemas/commonSchema.ts(25,48): error TS2339: Property 'price' does not exist on type '{ required: any; optional: any; }'.
src/components/shared/form/schemas/commonSchema.ts(26,41): error TS2339: Property 'taxRate' does not exist on type '{ required: any; optional: any; }'.
src/components/shared/form/schemas/commonValidation.ts(6,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/form/schemas/invoiceSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/form/schemas/invoiceSchema.ts(30,26): error TS2339: Property 'nonEmpty' does not exist on type '{ required: <T extends z.ZodTypeAny>(schema: T) => any; optional: <T extends z.ZodTypeAny>(schema: T) => any; }'.
src/components/shared/form/schemas/invoiceSchema.ts(32,27): error TS2339: Property 'description' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/shared/form/schemas/invoiceSchema.ts(36,40): error TS2339: Property 'registrationNumber' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/shared/form/schemas/invoiceSchema.ts(38,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/shared/form/schemas/purchaseOrderSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/form/schemas/purchaseOrderSchema.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/shared/form/schemas/purchaseOrderSchema.ts(19,26): error TS2339: Property 'nonEmpty' does not exist on type '{ required: <T extends z.ZodTypeAny>(schema: T) => any; optional: <T extends z.ZodTypeAny>(schema: T) => any; }'.
src/components/shared/form/schemas/purchaseOrderSchema.ts(20,27): error TS2339: Property 'description' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/shared/form/schemas/purchaseOrderSchema.ts(24,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/components/shared/form/schemas/vendorSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/form/schemas/vendorSchema.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/shared/form/schemas/vendorSchema.ts(13,26): error TS2339: Property 'name' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/shared/form/schemas/vendorSchema.ts(16,29): error TS2339: Property 'address' does not exist on type '{ required: any; optional: any; email: any; password: any; phone: any; }'.
src/components/shared/form/SelectField.tsx(3,59): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/TagField.tsx(3,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/TextareaField.tsx(3,41): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/form/TextareaField.tsx(16,6): error TS2741: Property 'control' is missing in type '{ children: Element; name: Path<T>; label: string | undefined; }' but required in type 'FormFieldProps<FieldValues>'.
src/components/shared/form/TextareaField.tsx(23,20): error TS7031: Binding element 'field' implicitly has an 'any' type.
src/components/shared/forms/BaseForm.tsx(11,8): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/forms/BaseForm.tsx(12,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/shared/forms/BaseForm.tsx(13,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/shared/forms/FormField.tsx(2,28): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/forms/TagInput.tsx(4,19): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/shared/forms/TagInput.tsx(6,33): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/forms/TagInput.tsx(16,21): error TS7016: Could not find a declaration file for module 'lodash/isEqual'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/lodash/isEqual.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/lodash` if it exists or add a new declaration (.d.ts) file containing `declare module 'lodash/isEqual';`
src/components/shared/forms/TagInput.tsx(57,13): error TS2741: Property 'id' is missing in type '{ name: string; }' but required in type 'Tag'.
src/components/shared/forms/TagInput.tsx(79,15): error TS2322: Type '{ children: (string | Element)[]; key: string; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & BadgeProps'.
src/components/shared/forms/TagInput.tsx(105,25): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/components/shared/forms/TextField.tsx(2,28): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/shared/hooks/useTags.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'Tag'.
src/components/shared/TagManager.tsx(7,25): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/shared/TagManager.tsx(136,31): error TS2322: Type '{ children: (string | false | Element)[]; key: string | undefined; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & BadgeProps'.
src/components/shared/TagManager.tsx(140,17): error TS2322: Type '{ children: Element; variant: string; size: string; className: string; onClick: () => void; "aria-label": string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/shared/TagManager.tsx(143,45): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/components/shared/TagManager.tsx(163,17): error TS2322: Type '{ children: (string | Element)[]; type: "button"; variant: string; className: string; onClick: () => Promise<void>; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/status/__tests__/StatusHistory.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/status/__tests__/StatusHistory.test.tsx(2,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/status/__tests__/StatusHistory.test.tsx(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/status/__tests__/StatusHistory.test.tsx(5,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/status/__tests__/StatusHistory.test.tsx(6,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/status/__tests__/StatusNotification.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/status/__tests__/StatusNotification.test.tsx(2,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/status/__tests__/StatusNotification.test.tsx(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/status/__tests__/StatusNotification.test.tsx(5,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/status/__tests__/StatusNotification.test.tsx(6,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/status/StatusHistory.tsx(8,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/status/StatusHistory.tsx(9,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/status/StatusHistory.tsx(10,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/status/StatusHistory.tsx(11,29): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/status/StatusHistory.tsx(94,33): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/status/StatusNotification.tsx(9,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/components/status/StatusNotification.tsx(10,28): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/status/StatusNotification.tsx(11,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/status/StatusNotification.tsx(12,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/status/StatusNotification.tsx(158,29): error TS2322: Type '{ children: string; variant: string; size: string; onClick: () => Promise<void>; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/TaxCalculator.tsx(2,59): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/TaxCalculator.tsx(4,10): error TS2305: Module '"@/domains/invoice/tax"' has no exported member 'validateTaxRate'.
src/components/ui/__tests__/checkbox.test.tsx(1,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/ui/__tests__/checkbox.test.tsx(2,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/ui/badge.tsx(2,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/badge.tsx(30,29): error TS2339: Property 'variant' does not exist on type 'BadgeProps'.
src/components/ui/button.stories.tsx(1,37): error TS2307: Cannot find module '@storybook/react' or its corresponding type declarations.
src/components/ui/button.stories.tsx(132,18): error TS7031: Binding element 'canvasElement' implicitly has an 'any' type.
src/components/ui/button.stories.tsx(132,33): error TS7031: Binding element 'args' implicitly has an 'any' type.
src/components/ui/button.tsx(2,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/button.tsx(37,17): error TS2339: Property 'variant' does not exist on type 'ButtonProps'.
src/components/ui/button.tsx(37,26): error TS2339: Property 'size' does not exist on type 'ButtonProps'.
src/components/ui/calendar.tsx(4,27): error TS2307: Cannot find module 'react-day-picker' or its corresponding type declarations.
src/components/ui/calendar.tsx(5,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/components/ui/checkbox.tsx(4,36): error TS2307: Cannot find module '@radix-ui/react-checkbox' or its corresponding type declarations.
src/components/ui/checkbox.tsx(5,23): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/command.tsx(4,34): error TS2307: Cannot find module '@radix-ui/react-dialog' or its corresponding type declarations.
src/components/ui/command.tsx(5,45): error TS2307: Cannot find module 'cmdk' or its corresponding type declarations.
src/components/ui/command.tsx(6,24): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/date-picker.tsx(4,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/components/ui/date-picker.tsx(5,42): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/date-picker.tsx(6,56): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/ui/date-picker.tsx(14,27): error TS2307: Cannot find module 'react-day-picker' or its corresponding type declarations.
src/components/ui/date-picker.tsx(34,24): error TS7031: Binding element 'field' implicitly has an 'any' type.
src/components/ui/date-picker.tsx(38,21): error TS2322: Type '{ children: any[]; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/ui/date-picker.tsx(70,15): error TS2322: Type '{ children: any[]; variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/ui/date-picker.tsx(83,26): error TS7006: Parameter 'date' implicitly has an 'any' type.
src/components/ui/dialog.tsx(4,34): error TS2307: Cannot find module '@radix-ui/react-dialog' or its corresponding type declarations.
src/components/ui/dialog.tsx(5,19): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/dropdown-menu.tsx(2,40): error TS2307: Cannot find module '@radix-ui/react-dropdown-menu' or its corresponding type declarations.
src/components/ui/dropdown-menu.tsx(3,45): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/form.tsx(2,33): error TS2307: Cannot find module '@radix-ui/react-label' or its corresponding type declarations.
src/components/ui/form.tsx(3,22): error TS2307: Cannot find module '@radix-ui/react-slot' or its corresponding type declarations.
src/components/ui/form.tsx(11,8): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/ui/label.tsx(4,33): error TS2307: Cannot find module '@radix-ui/react-label' or its corresponding type declarations.
src/components/ui/label.tsx(5,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/popover.tsx(4,35): error TS2307: Cannot find module '@radix-ui/react-popover' or its corresponding type declarations.
src/components/ui/scroll-area.tsx(2,38): error TS2307: Cannot find module '@radix-ui/react-scroll-area' or its corresponding type declarations.
src/components/ui/select.tsx(4,34): error TS2307: Cannot find module '@radix-ui/react-select' or its corresponding type declarations.
src/components/ui/select.tsx(5,36): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/sheet.tsx(2,33): error TS2307: Cannot find module '@radix-ui/react-dialog' or its corresponding type declarations.
src/components/ui/sheet.tsx(3,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/sheet.tsx(4,19): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/sheet.tsx(57,6): error TS2339: Property 'side' does not exist on type 'SheetContentProps'.
src/components/ui/sheet.tsx(57,22): error TS2339: Property 'className' does not exist on type 'SheetContentProps'.
src/components/ui/sheet.tsx(57,33): error TS2339: Property 'children' does not exist on type 'SheetContentProps'.
src/components/ui/switch.tsx(2,35): error TS2307: Cannot find module '@radix-ui/react-switch' or its corresponding type declarations.
src/components/ui/toast.tsx(4,34): error TS2307: Cannot find module '@radix-ui/react-toast' or its corresponding type declarations.
src/components/ui/toast.tsx(5,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/toast.tsx(6,19): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/toast/toast.tsx(4,34): error TS2307: Cannot find module '@radix-ui/react-toast' or its corresponding type declarations.
src/components/ui/toast/toast.tsx(5,40): error TS2307: Cannot find module 'class-variance-authority' or its corresponding type declarations.
src/components/ui/toast/toast.tsx(6,19): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/ui/toast/use-toast.ts(158,22): error TS7006: Parameter 'open' implicitly has an 'any' type.
src/components/ui/use-toast.ts(160,22): error TS7006: Parameter 'open' implicitly has an 'any' type.
src/components/ui/visually-hidden.stories.tsx(1,37): error TS2307: Cannot find module '@storybook/react' or its corresponding type declarations.
src/components/vendor/VendorContactsForm.tsx(3,47): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/vendor/VendorContactsForm.tsx(17,20): error TS7006: Parameter 'field' implicitly has an 'any' type.
src/components/vendor/VendorContactsForm.tsx(17,27): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/components/vendor/VendorContactsForm.tsx(49,15): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => any; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/vendor/VendorContactsForm.tsx(60,11): error TS2322: Type '{ children: string; type: "button"; variant: string; onClick: () => any; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/vendors/__tests__/VendorForm.test.tsx(1,52): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/vendors/__tests__/VendorForm.test.tsx(6,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/vendors/__tests__/VendorForm.test.tsx(64,14): error TS7006: Parameter 'button' implicitly has an 'any' type.
src/components/vendors/__tests__/VendorForm.test.tsx(96,20): error TS7006: Parameter 'input' implicitly has an 'any' type.
src/components/vendors/__tests__/VendorForm.test.tsx(101,21): error TS7006: Parameter 'select' implicitly has an 'any' type.
src/components/vendors/__tests__/VendorList.test.tsx(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/components/vendors/__tests__/VendorList.test.tsx(2,43): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/components/vendors/__tests__/VendorList.test.tsx(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/vendors/__tests__/VendorList.test.tsx(4,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/vendors/schemas.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/vendors/schemas.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/vendors/schemas.ts(2,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/vendors/schemas/vendorSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/components/vendors/schemas/vendorSchema.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/vendors/schemas/vendorSchema.ts(2,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/vendors/VendorFilters.tsx(5,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/vendors/VendorFilters.tsx(5,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/vendors/VendorFilters.tsx(49,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/vendors/VendorFilters.tsx(69,29): error TS7006: Parameter 'value' implicitly has an 'any' type.
src/components/vendors/VendorForm.tsx(3,25): error TS2307: Cannot find module 'react-hook-form' or its corresponding type declarations.
src/components/vendors/VendorForm.tsx(4,29): error TS2307: Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
src/components/vendors/VendorList.tsx(5,18): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/components/vendors/VendorList.tsx(5,34): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/components/vendors/VendorList.tsx(6,68): error TS2307: Cannot find module 'lucide-react' or its corresponding type declarations.
src/components/vendors/VendorList.tsx(96,13): error TS2322: Type '{ children: Element; variant: string; size: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/vendors/VendorList.tsx(103,13): error TS2322: Type '{ children: Element; variant: string; size: string; onClick: () => void; }' is not assignable to type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & ButtonProps & RefAttributes<HTMLButtonElement>'.
src/components/vendors/VendorList.tsx(149,42): error TS2322: Type '{ children: string; key: string; variant: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & BadgeProps'.
src/components/vendors/VendorList.tsx(184,38): error TS2322: Type '{ children: string; key: string; variant: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & BadgeProps'.
src/components/vendors/VendorManagement.tsx(6,10): error TS2305: Module '"@/types/vendor"' has no exported member 'ExtendedVendor'.
src/components/vendors/VendorManagement.tsx(6,26): error TS2305: Module '"@/types/vendor"' has no exported member 'VendorCreateInput'.
src/components/vendors/VendorManagement.tsx(31,30): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/components/vendors/VendorManagement.tsx(56,30): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/domains/invoice/__tests__/progress.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/domains/invoice/__tests__/progress.test.ts(84,21): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(85,21): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(95,34): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(100,21): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(103,33): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(115,34): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(119,21): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(120,47): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(127,34): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(143,33): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(153,23): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(158,21): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(188,35): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/progress.test.ts(193,23): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(198,21): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/progress.test.ts(222,21): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/__tests__/service.test.ts(1,54): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/domains/invoice/__tests__/service.test.ts(90,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(100,23): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(104,48): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(107,39): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(120,23): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(127,31): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(131,23): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(138,31): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(161,25): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/service.test.ts(183,25): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/__tests__/status.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/domains/invoice/__tests__/tax.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/domains/invoice/__tests__/tax.test.ts(2,10): error TS2305: Module '"../tax"' has no exported member 'calculateItemTax'.
src/domains/invoice/__tests__/tax.test.ts(2,28): error TS2305: Module '"../tax"' has no exported member 'calculateTotal'.
src/domains/invoice/__tests__/tax.test.ts(2,44): error TS2305: Module '"../tax"' has no exported member 'calculateSubtotal'.
src/domains/invoice/__tests__/tax.test.ts(2,63): error TS2305: Module '"../tax"' has no exported member 'calculateTotalTax'.
src/domains/invoice/__tests__/tax.test.ts(2,103): error TS2305: Module '"../tax"' has no exported member 'convertTaxRateToDecimal'.
src/domains/invoice/__tests__/tax.test.ts(81,42): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(102,42): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(115,42): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(129,42): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(130,31): error TS2339: Property 'taxRate' does not exist on type 'ClientTaxCalculation'.
src/domains/invoice/__tests__/tax.test.ts(131,31): error TS2339: Property 'taxRate' does not exist on type 'ClientTaxCalculation'.
src/domains/invoice/__tests__/tax.test.ts(321,45): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(345,45): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(375,45): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(388,45): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/__tests__/tax.test.ts(407,45): error TS2345: Argument of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem[]' is not assignable to parameter of type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem[]'.
  Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/types").TaxableItem' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/tax").TaxableItem'.
    Types of property 'unitPrice' are incompatible.
      Type 'Decimal' is not assignable to type 'number'.
src/domains/invoice/progress.ts(2,25): error TS2305: Module '"@prisma/client"' has no exported member 'Notification'.
src/domains/invoice/progress.ts(28,19): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/progress.ts(29,19): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/progress.ts(40,16): error TS2677: A type predicate's type must be assignable to its parameter's type.
  Type '"APPROVED" | "REJECTED" | "OVERDUE"' is not assignable to type 'InvoiceStatus'.
    Type '"REJECTED"' is not assignable to type 'InvoiceStatus'.
src/domains/invoice/progress.ts(54,18): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/progress.ts(70,13): error TS2353: Object literal may only specify known properties, and 'users' does not exist in type 'VendorInclude<DefaultArgs>'.
src/domains/invoice/progress.ts(82,18): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/domains/invoice/progress.ts(82,35): error TS7006: Parameter 'user' implicitly has an 'any' type.
src/domains/invoice/progress.ts(87,15): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/domains/invoice/progress.ts(100,18): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/progress.ts(106,39): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/domains/invoice/progress.ts(107,17): error TS7006: Parameter 'user' implicitly has an 'any' type.
src/domains/invoice/progress.ts(108,14): error TS7006: Parameter 'user' implicitly has an 'any' type.
src/domains/invoice/progress.ts(132,19): error TS2339: Property 'statusHistory' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/progress.ts(155,19): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/progress.ts(178,18): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/domains/invoice/progress.ts(210,26): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/progress.ts(212,26): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/service.ts(7,15): error TS2459: Module '"./tax"' declares 'TaxableItem' locally, but it is not exported.
src/domains/invoice/service.ts(17,10): error TS2305: Module '"@prisma/client"' has no exported member 'InvoiceItem'.
src/domains/invoice/service.ts(75,25): error TS2322: Type 'InvoiceStatus' is not assignable to type 'InvoiceStatus | undefined'.
  Type '"PENDING"' is not assignable to type 'InvoiceStatus | undefined'.
src/domains/invoice/service.ts(81,63): error TS2345: Argument of type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is not assignable to parameter of type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
  Type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is missing the following properties from type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; }': vendor, template, items, purchaseOrder
src/domains/invoice/service.ts(91,43): error TS2345: Argument of type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is not assignable to parameter of type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
  Type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is missing the following properties from type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; }': vendor, template, items, purchaseOrder
src/domains/invoice/service.ts(122,28): error TS2322: Type '"OVERDUE"' is not assignable to type 'InvoiceStatus'.
src/domains/invoice/service.ts(132,34): error TS2339: Property 'template' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/domains/invoice/service.ts(133,54): error TS2345: Argument of type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is not assignable to parameter of type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
  Type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }' is missing the following properties from type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; }': vendor, template, items, purchaseOrder
src/domains/invoice/service.ts(141,25): error TS2339: Property 'registrationNumber' does not exist on type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }'.
src/domains/invoice/service.ts(145,30): error TS2339: Property 'bankInfo' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(146,47): error TS2339: Property 'bankInfo' does not exist on type 'never'.
src/domains/invoice/service.ts(151,28): error TS2339: Property 'id' does not exist on type 'never'.
src/domains/invoice/service.ts(153,40): error TS2339: Property 'contractorName' does not exist on type 'never'.
src/domains/invoice/service.ts(154,43): error TS2339: Property 'contractorAddress' does not exist on type 'never'.
src/domains/invoice/service.ts(155,44): error TS2339: Property 'registrationNumber' does not exist on type 'never'.
src/domains/invoice/service.ts(156,38): error TS2339: Property 'paymentTerms' does not exist on type 'never'.
src/domains/invoice/service.ts(159,57): error TS2339: Property 'map' does not exist on type 'never'.
src/domains/invoice/service.ts(159,61): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/domains/invoice/service.ts(174,42): error TS2339: Property 'registrationNumber' does not exist on type '{ id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }'.
src/domains/invoice/service.ts(186,7): error TS2561: Object literal may only specify known properties, but 'templateId' does not exist in type 'QualifiedInvoice'. Did you mean to write 'template'?
src/domains/invoice/service.ts(186,27): error TS2551: Property 'templateId' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'. Did you mean 'template'?
src/domains/invoice/service.ts(187,32): error TS2551: Property 'purchaseOrderId' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'. Did you mean 'purchaseOrder'?
src/domains/invoice/service.ts(188,30): error TS2339: Property 'invoiceNumber' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(190,26): error TS2339: Property 'issueDate' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(191,24): error TS2339: Property 'dueDate' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(192,22): error TS2339: Property 'notes' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(208,28): error TS2339: Property 'updatedById' does not exist on type '{ vendor: { id: string; name: string; email: string; phone: string | null; address: string | null; firstTag: string | null; secondTag: string | null; createdAt: Date; updatedAt: Date; createdById: string; }; template: never; items: never; purchaseOrder: never; } & { ...; }'.
src/domains/invoice/service.ts(220,5): error TS2322: Type 'ClientTaxSummary' is not assignable to type 'InvoiceTaxSummary'.
  Types of property 'byRate' are incompatible.
    Type 'Record<string, ClientTaxCalculation>' is missing the following properties from type 'TaxCalculation[]': length, pop, push, concat, and 35 more.
src/domains/invoice/types.ts(1,50): error TS2305: Module '"@prisma/client"' has no exported member 'InvoiceItem'.
src/domains/invoice/types.ts(9,26): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(10,28): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(12,23): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(13,26): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(14,27): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(19,18): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(20,18): error TS2339: Property 'REVIEWING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(22,18): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(23,18): error TS2339: Property 'OVERDUE' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(24,18): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/domains/invoice/types.ts(25,18): error TS2339: Property 'SENT' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(1,82): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
src/e2e/invoice-flow.test.ts(2,45): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/e2e/invoice-flow.test.ts(21,18): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(63,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(74,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(85,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(96,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(107,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(118,34): error TS7031: Binding element 'testPage' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(129,37): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(156,42): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(187,45): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(218,49): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(245,49): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(255,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(276,38): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(286,29): error TS2339: Property 'PAID' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(304,46): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(314,29): error TS2339: Property 'REJECTED' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(338,44): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(348,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(366,38): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(376,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/e2e/invoice-flow.test.ts(397,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(442,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/invoice-flow.test.ts(486,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/performance.test.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
src/e2e/performance.test.ts(4,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/performance.test.ts(20,35): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/performance.test.ts(32,33): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/performance.test.ts(46,39): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/e2e/performance.test.ts(46,45): error TS7031: Binding element 'browser' implicitly has an 'any' type.
src/e2e/performance.test.ts(62,46): error TS7006: Parameter 'm' implicitly has an 'any' type.
src/emails/InvoiceEmail.tsx(11,8): error TS2307: Cannot find module '@react-email/components' or its corresponding type declarations.
src/emails/InvoiceEmail.tsx(26,38): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(53,31): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(55,40): error TS2339: Property 'issueDate' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(57,41): error TS2339: Property 'dueDate' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(68,29): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(70,29): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(72,30): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(74,30): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(76,30): error TS2339: Property 'bankInfo' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(82,24): error TS2339: Property 'template' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(84,24): error TS2339: Property 'template' does not exist on type 'Invoice'.
src/emails/InvoiceEmail.tsx(86,30): error TS2339: Property 'template' does not exist on type 'Invoice'.
src/hooks/use-toast.ts(156,22): error TS7006: Parameter 'open' implicitly has an 'any' type.
src/lib/api-utils.ts(2,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/lib/api-utils.ts(33,24): error TS18046: 'error' is of type 'unknown'.
src/lib/auth.ts(1,31): error TS2307: Cannot find module '@next-auth/prisma-adapter' or its corresponding type declarations.
src/lib/auth.ts(7,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/lib/auth.ts(66,22): error TS2339: Property 'name' does not exist on type '{ id: string; email: string; createdAt: Date; updatedAt: Date; hashedPassword: string; role: string; }'.
src/lib/auth/index.ts(1,10): error TS2724: '"./session-manager"' has no exported member named 'session'. Did you mean 'Session'?
src/lib/auth/index.ts(2,10): error TS2305: Module '"./mock-session"' has no exported member 'mockSession'.
src/lib/auth/mock-session.ts(2,30): error TS7016: Could not find a declaration file for module 'uuid'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/uuid/dist/esm-browser/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/uuid` if it exists or add a new declaration (.d.ts) file containing `declare module 'uuid';`
src/lib/auth/session-manager.ts(3,30): error TS7016: Could not find a declaration file for module 'uuid'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/uuid/dist/esm-browser/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/uuid` if it exists or add a new declaration (.d.ts) file containing `declare module 'uuid';`
src/lib/auth/session-manager.ts(372,24): error TS7006: Parameter 'key' implicitly has an 'any' type.
src/lib/auth/session-manager.ts(378,29): error TS7006: Parameter 'result' implicitly has an 'any' type.
src/lib/auth/session-manager.ts(378,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
src/lib/crypto.ts(1,20): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/lib/crypto.ts(2,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/lib/export/payment-history.ts(2,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/lib/export/payment-history.ts(3,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/lib/export/payment-history.ts(29,13): error TS2339: Property 'invoiceNumber' does not exist on type 'ExportInvoice'.
src/lib/export/payment-history.ts(31,29): error TS2339: Property 'issueDate' does not exist on type 'ExportInvoice'.
src/lib/export/payment-history.ts(32,29): error TS2339: Property 'dueDate' does not exist on type 'ExportInvoice'.
src/lib/invoice-generator.ts(1,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/lib/invoice-generator.ts(2,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/lib/mail/__tests__/smtp.test.ts(1,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/lib/mail/index.ts(1,10): error TS2724: '"./smtp"' has no exported member named 'sendEmail'. Did you mean 'sendMail'?
src/lib/mail/index.ts(3,60): error TS2724: '"./types"' has no exported member named 'MailTemplates'. Did you mean 'MailTemplate'?
src/lib/mail/mock.ts(6,12): error TS2314: Generic type 'MailContext<T>' requires 1 type argument(s).
src/lib/mail/sendMail.ts(1,24): error TS7016: Could not find a declaration file for module 'nodemailer'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/nodemailer/lib/nodemailer.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/nodemailer` if it exists or add a new declaration (.d.ts) file containing `declare module 'nodemailer';`
src/lib/mail/sendMail.ts(2,29): error TS2307: Cannot find module 'pdf-lib' or its corresponding type declarations.
src/lib/mail/sendMail.ts(7,27): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/lib/mail/sendMail.ts(114,17): error TS2339: Property 'reminderLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/lib/mail/smtp.ts(1,24): error TS7016: Could not find a declaration file for module 'nodemailer'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/nodemailer/lib/nodemailer.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/nodemailer` if it exists or add a new declaration (.d.ts) file containing `declare module 'nodemailer';`
src/lib/mail/templates/__tests__/invoiceCreated.test.ts(1,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/lib/mail/templates/__tests__/invoiceCreated.test.ts(42,36): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/mail/templates/index.ts(1,10): error TS2724: '"../types"' has no exported member named 'MailTemplates'. Did you mean 'MailTemplate'?
src/lib/mail/templates/index.ts(2,10): error TS2305: Module '"./invoiceCreated"' has no exported member 'invoiceCreated'.
src/lib/mail/templates/invoiceStatusUpdated.ts(6,14): error TS2322: Type '({ invoice, oldStatus, newStatus }: { invoice: any; oldStatus: InvoiceStatus; newStatus: InvoiceStatus; }) => Promise<{ subject: string; body: string; }>' is not assignable to type 'MailTemplate<"invoiceStatusUpdated">'.
src/lib/mail/templates/invoiceStatusUpdated.ts(6,49): error TS2344: Type '"invoiceStatusUpdated"' does not satisfy the constraint 'keyof MailTemplateDataMap'.
src/lib/mail/templates/orderCreated.ts(5,14): error TS2322: Type '({ purchaseOrder }: { purchaseOrder: any; }) => Promise<{ subject: string; body: string; }>' is not assignable to type 'MailTemplate<"purchaseOrderCreated">'.
src/lib/mail/templates/orderCreated.ts(5,41): error TS2344: Type '"purchaseOrderCreated"' does not satisfy the constraint 'keyof MailTemplateDataMap'.
src/lib/mail/templates/orderCreated.ts(5,76): error TS7031: Binding element 'purchaseOrder' implicitly has an 'any' type.
src/lib/mail/templates/paymentReminder.ts(5,14): error TS2322: Type '({ invoice, daysOverdue }: { invoice: any; daysOverdue: any; }) => Promise<{ subject: string; body: string; }>' is not assignable to type 'MailTemplate<"paymentReminder">'.
src/lib/mail/templates/paymentReminder.ts(6,3): error TS7031: Binding element 'invoice' implicitly has an 'any' type.
src/lib/mail/templates/paymentReminder.ts(7,3): error TS7031: Binding element 'daysOverdue' implicitly has an 'any' type.
src/lib/mail/templates/purchaseOrderCreated.ts(5,14): error TS2322: Type '({ purchaseOrder }: { purchaseOrder: any; }) => Promise<{ subject: string; body: string; }>' is not assignable to type 'MailTemplate<"purchaseOrderCreated">'.
src/lib/mail/templates/purchaseOrderCreated.ts(5,49): error TS2344: Type '"purchaseOrderCreated"' does not satisfy the constraint 'keyof MailTemplateDataMap'.
src/lib/mail/templates/purchaseOrderCreated.ts(5,84): error TS7031: Binding element 'purchaseOrder' implicitly has an 'any' type.
src/lib/mail/templates/purchaseOrderStatusUpdated.ts(25,14): error TS2322: Type '({ purchaseOrder, oldStatus, newStatus }: { purchaseOrder: any; oldStatus: any; newStatus: any; }) => Promise<{ subject: string; body: string; }>' is not assignable to type 'MailTemplate<"purchaseOrderStatusUpdated">'.
src/lib/mail/templates/purchaseOrderStatusUpdated.ts(25,55): error TS2344: Type '"purchaseOrderStatusUpdated"' does not satisfy the constraint 'keyof MailTemplateDataMap'.
src/lib/mail/templates/purchaseOrderStatusUpdated.ts(26,3): error TS7031: Binding element 'purchaseOrder' implicitly has an 'any' type.
src/lib/mail/templates/purchaseOrderStatusUpdated.ts(27,3): error TS7031: Binding element 'oldStatus' implicitly has an 'any' type.
src/lib/mail/templates/purchaseOrderStatusUpdated.ts(28,3): error TS7031: Binding element 'newStatus' implicitly has an 'any' type.
src/lib/mail/templates/reminder.ts(1,27): error TS2305: Module '"@prisma/client"' has no exported member 'ReminderType'.
src/lib/mail/templates/reminder.ts(2,24): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/lib/mail/templates/reminder.ts(3,20): error TS2307: Cannot find module 'date-fns/locale' or its corresponding type declarations.
src/lib/mail/templates/reminder.ts(16,40): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(18,37): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(20,38): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(22,29): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(28,52): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(43,17): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(58,17): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/templates/reminder.ts(76,17): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; } & { vendor: Pick<{ id: string; ... 8 more ...; createdById: string; }, "name" | "email">; }'.
src/lib/mail/types.ts(2,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/lib/mail/utils.ts(2,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/lib/mail/utils.ts(2,28): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoiceItem'.
src/lib/mail/utils.ts(33,34): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/mail/utils.ts(33,39): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/mail/utils.ts(34,35): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/mail/utils.ts(34,40): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/notification/email-service.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/lib/notification/email-service.ts(43,19): error TS2339: Property 'contractorName' does not exist on type 'Invoice'.
src/lib/notification/email-service.ts(45,25): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/lib/notification/email-service.ts(47,24): error TS2339: Property 'dueDate' does not exist on type 'Invoice'.
src/lib/notification/email-service.ts(56,19): error TS2339: Property 'contractorName' does not exist on type 'Invoice'.
src/lib/notification/email-service.ts(58,25): error TS2339: Property 'invoiceNumber' does not exist on type 'Invoice'.
src/lib/notification/email-service.ts(60,24): error TS2339: Property 'dueDate' does not exist on type 'Invoice'.
src/lib/notification/payment-reminder.ts(14,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/lib/notification/payment-reminder.ts(15,7): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/lib/notification/payment-reminder.ts(27,7): error TS2353: Object literal may only specify known properties, and 'template' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/lib/notification/payment-reminder.ts(37,18): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(39,30): error TS2339: Property 'template' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(47,21): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(48,42): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(50,11): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(52,17): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(54,16): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(65,20): error TS2339: Property 'reminderLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/lib/notification/payment-reminder.ts(85,29): error TS2339: Property 'PENDING' does not exist on type '{ DRAFT: "DRAFT"; APPROVED: "APPROVED"; }'.
src/lib/notification/payment-reminder.ts(86,7): error TS2353: Object literal may only specify known properties, and 'dueDate' does not exist in type 'InvoiceWhereInput'.
src/lib/notification/payment-reminder.ts(98,7): error TS2353: Object literal may only specify known properties, and 'template' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/lib/notification/payment-reminder.ts(108,18): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(110,30): error TS2339: Property 'template' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(118,21): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(119,44): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(121,11): error TS2551: Property 'vendor' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'. Did you mean 'vendorId'?
src/lib/notification/payment-reminder.ts(123,17): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(125,16): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/notification/payment-reminder.ts(136,20): error TS2339: Property 'reminderLog' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/lib/order-status-manager.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/lib/pdf.ts(1,19): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/lib/pdf/__tests__/invoice.test.ts(1,42): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/lib/pdf/fonts.ts(1,44): error TS2307: Cannot find module 'pdf-lib' or its corresponding type declarations.
src/lib/pdf/templates/purchase-order.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/lib/pdf/templates/purchase-order.ts(1,33): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderItem'.
src/lib/pdf/templates/purchase-order.ts(2,49): error TS2307: Cannot find module 'pdf-lib' or its corresponding type declarations.
src/lib/pdf/templates/purchase-order.ts(101,24): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/pdf/utils.ts(2,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/lib/pdf/utils.ts(2,28): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoiceItem'.
src/lib/pdf/utils.ts(41,34): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/pdf/utils.ts(41,39): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/pdf/utils.ts(42,35): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/pdf/utils.ts(42,40): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/pdf/utils.ts(84,10): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/pdf/utils.ts(84,15): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/pdf/utils.ts(88,10): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/lib/pdf/utils.ts(88,15): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/lib/redis/client.ts(1,19): error TS2307: Cannot find module 'ioredis' or its corresponding type declarations.
src/lib/test/auth-helpers.ts(1,36): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
src/lib/test/auth-helpers.ts(3,22): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/lib/test/auth-helpers.ts(33,7): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserUpdateInput, UserUncheckedUpdateInput> & UserUncheckedUpdateInput) | (Without<...> & UserUpdateInput)'.
src/lib/test/auth-helpers.ts(38,7): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(Without<UserCreateInput, UserUncheckedCreateInput> & UserUncheckedCreateInput) | (Without<...> & UserCreateInput)'.
src/lib/test/auth-helpers.ts(58,31): error TS7031: Binding element 'page' implicitly has an 'any' type.
src/lib/test/auth-helpers.ts(58,39): error TS7006: Parameter 'use' implicitly has an 'any' type.
src/lib/utils.ts(1,39): error TS2307: Cannot find module 'clsx' or its corresponding type declarations.
src/lib/utils.ts(2,25): error TS2307: Cannot find module 'tailwind-merge' or its corresponding type declarations.
src/lib/utils/animation.ts(1,26): error TS2307: Cannot find module 'framer-motion' or its corresponding type declarations.
src/lib/utils/invoice-notifications.ts(23,39): error TS2339: Property 'notification' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/lib/utils/invoice-notifications.ts(55,32): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/utils/invoice-notifications.ts(60,32): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/utils/invoice-notifications.ts(65,32): error TS2339: Property 'invoiceNumber' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/utils/status.ts(10,15): error TS2322: Type '"PENDING"' is not assignable to type 'InvoiceStatus'.
src/lib/utils/status.ts(13,18): error TS2322: Type '"PAID"' is not assignable to type 'InvoiceStatus'.
src/lib/utils/status.ts(13,26): error TS2322: Type '"REJECTED"' is not assignable to type 'InvoiceStatus'.
src/lib/utils/status.ts(25,36): error TS2339: Property 'dueDate' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; createdById: string; vendorId: string; status: InvoiceStatus; totalAmount: Decimal; }'.
src/lib/utils/status.ts(29,5): error TS2367: This comparison appears to be unintentional because the types 'InvoiceStatus' and '"PAID"' have no overlap.
src/lib/utils/status.ts(30,5): error TS2367: This comparison appears to be unintentional because the types 'InvoiceStatus' and '"REJECTED"' have no overlap.
src/lib/utils/status.ts(40,5): error TS2322: Type '"REJECTED"' is not assignable to type 'InvoiceStatus'.
src/lib/utils/status.ts(57,7): error TS2367: This comparison appears to be unintentional because the types 'InvoiceStatus' and '"PAID"' have no overlap.
src/lib/utils/status.ts(68,5): error TS2353: Object literal may only specify known properties, and ''PENDING'' does not exist in type 'Record<InvoiceStatus, string>'.
src/lib/validations/invoice.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/lib/validations/invoice.ts(6,44): error TS2339: Property 'itemName' does not exist on type '"必須項目です"'.
src/lib/validations/invoice.ts(8,35): error TS2339: Property 'number' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/invoice.ts(9,36): error TS2339: Property 'number' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/invoice.ts(10,41): error TS2339: Property 'number' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/invoice.ts(14,44): error TS2339: Property 'vendor' does not exist on type '"必須項目です"'.
src/lib/validations/invoice.ts(22,57): error TS2339: Property 'itemName' does not exist on type '"必須項目です"'.
src/lib/validations/invoice.ts(23,17): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/lib/validations/invoice.ts(23,23): error TS7006: Parameter 'ctx' implicitly has an 'any' type.
src/lib/validations/invoice.ts(27,20): error TS2339: Property 'date' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/purchase-order.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/lib/validations/purchase-order.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/lib/validations/vendor.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/lib/validations/vendor.ts(6,40): error TS2339: Property 'vendor' does not exist on type '"必須項目です"'.
src/lib/validations/vendor.ts(7,31): error TS2339: Property 'format' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/vendor.ts(10,29): error TS2339: Property 'format' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/lib/validations/vendor.ts(19,29): error TS2339: Property 'format' does not exist on type '{ auth: { required: string; invalid: string; expired: string; }; validation: { invalid: string; arrayMinLength: string; invalidDate: string; invalidEmail: string; invalidPassword: string; invalidNumber: string; invalidUUID: string; invalidStatus: string; }; ... 9 more ...; invalidPhone: "無効な電話番号です"; }'.
src/providers/QueryProvider.tsx(3,50): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/test/factories/invoice.ts(6,3): error TS2305: Module '"@/types/base/invoice"' has no exported member 'BaseVendor'.
src/test/factories/invoice.ts(23,3): error TS2739: Type 'Decimal' is missing the following properties from type 'MonetaryAmount': amount, currency
src/test/factories/invoice.ts(24,3): error TS2322: Type 'Decimal' is not assignable to type 'number'.
src/test/factories/invoice.ts(37,3): error TS2322: Type 'import("/Volumes/strage/opus_localdev/opus_comp/src/domains/invoice/status").InvoiceStatus' is not assignable to type 'import("/Volumes/strage/opus_localdev/opus_comp/src/types/base/invoice").InvoiceStatus'.
  Type '"DRAFT"' is not assignable to type 'InvoiceStatus'.
src/test/factories/invoice.ts(54,3): error TS2322: Type 'Decimal' is not assignable to type 'number'.
src/test/factories/invoice.ts(87,3): error TS2353: Object literal may only specify known properties, and 'contractorName' does not exist in type 'BaseInvoiceTemplate'.
src/test/factories/invoice.ts(101,3): error TS2353: Object literal may only specify known properties, and 'tel' does not exist in type 'BaseIssuer'.
src/test/factories/tax.ts(2,3): error TS2724: '"@/types/base/tax"' has no exported member named 'ViewTaxCalculation'. Did you mean 'DbTaxCalculation'?
src/test/factories/tax.ts(3,3): error TS2305: Module '"@/types/base/tax"' has no exported member 'ViewTaxSummary'.
src/test/factories/tax.ts(4,3): error TS2305: Module '"@/types/base/tax"' has no exported member 'TAX_RATES'.
src/test/helpers/invoice.ts(1,10): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoice'.
src/test/helpers/invoice.ts(1,28): error TS2305: Module '"@/types/invoice"' has no exported member 'QualifiedInvoiceItem'.
src/test/helpers/mockApi.ts(1,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockApi.ts(33,5): error TS2698: Spread types may only be created from object types.
src/test/helpers/mockApi.ts(57,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(62,39): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(68,18): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/test/helpers/mockApi.ts(74,40): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(82,29): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(84,24): error TS2551: Property 'toBeUndefined' does not exist on type 'Assertion'. Did you mean 'undefined'?
src/test/helpers/mockApi.ts(89,29): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(92,26): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockApi.ts(99,23): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/test/helpers/mockData.ts(1,47): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/test/helpers/mockData.ts(1,69): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/test/helpers/mockData.ts(2,22): error TS2307: Cannot find module 'bcryptjs' or its corresponding type declarations.
src/test/helpers/mockData.ts(3,30): error TS7016: Could not find a declaration file for module 'uuid'. '/Volumes/strage/opus_localdev/opus_comp/node_modules/uuid/dist/esm-browser/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/uuid` if it exists or add a new declaration (.d.ts) file containing `declare module 'uuid';`
src/test/helpers/mockData.ts(4,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockData.ts(36,24): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/test/helpers/mockData.ts(72,28): error TS2344: Type '"name" | "category"' does not satisfy the constraint '"id" | "name" | "email" | "phone" | "address" | "firstTag" | "secondTag" | "createdAt" | "updatedAt" | "createdById"'.
  Type '"category"' is not assignable to type '"id" | "name" | "email" | "phone" | "address" | "firstTag" | "secondTag" | "createdAt" | "updatedAt" | "createdById"'.
src/test/helpers/mockData.ts(80,5): error TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'UserUncheckedCreateInput'.
src/test/helpers/mockData.ts(106,9): error TS2322: Type '{ createdById: string; name: string; category: VendorCategory; email?: string | undefined; phone?: string | undefined; address?: string | undefined; id: any; }' is not assignable to type 'VendorUncheckedCreateInput'.
  Types of property 'email' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.
src/test/helpers/mockData.ts(122,35): error TS2724: '"/Volumes/strage/opus_localdev/opus_comp/node_modules/.prisma/client/index".Prisma' has no exported member named 'PurchaseOrderUncheckedCreateInput'. Did you mean 'UserUncheckedCreateInput'?
src/test/helpers/mockData.ts(133,42): error TS2339: Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/test/helpers/mockData.ts(166,5): error TS2353: Object literal may only specify known properties, and 'issueDate' does not exist in type 'InvoiceUncheckedCreateInput'.
src/test/helpers/mockData.ts(188,7): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type 'InvoiceInclude<DefaultArgs>'.
src/test/helpers/mockForm.ts(1,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockForm.ts(2,44): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/test/helpers/mockForm.ts(3,23): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/test/helpers/mockForm.ts(4,26): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/test/helpers/mockForm.ts(26,23): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(33,46): error TS2339: Property 'rejects' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(89,19): error TS2339: Property 'toHaveValue' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(96,21): error TS2339: Property 'toHaveTextContent' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(105,22): error TS2339: Property 'toBeEnabled' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(110,22): error TS2551: Property 'toBeDisabled' does not exist on type 'Assertion'. Did you mean 'disabled'?
src/test/helpers/mockForm.ts(115,22): error TS2339: Property 'toHaveAttribute' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(124,21): error TS2339: Property 'toBeRequired' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(129,21): error TS2339: Property 'toHaveAttribute' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(134,21): error TS2339: Property 'toHaveAttribute' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(139,21): error TS2339: Property 'toHaveAttribute' does not exist on type 'Assertion'.
src/test/helpers/mockForm.ts(150,21): error TS2339: Property 'toHaveValue' does not exist on type 'Assertion'.
src/test/helpers/mockHelpers.ts(1,53): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockQuery.ts(1,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockQuery.ts(2,29): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/test/helpers/mockQuery.ts(114,25): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/test/helpers/mockQuery.ts(115,30): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(120,30): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(121,27): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(126,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(127,27): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(129,28): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/test/helpers/mockQuery.ts(142,29): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(143,32): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(153,29): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(154,30): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(166,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/test/helpers/mockQuery.ts(171,32): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockQuery.ts(176,39): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockRouter.ts(1,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockRouter.ts(97,25): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/test/helpers/mockRouter.ts(101,25): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/mockRouter.ts(105,28): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/mockRouter.ts(109,28): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/mockRouter.ts(113,29): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(1,20): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/mockSession.ts(119,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(120,26): error TS2339: Property 'toBeTruthy' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(124,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(125,26): error TS2339: Property 'toBeNull' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(129,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(130,26): error TS2339: Property 'toBeNull' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(135,22): error TS2339: Property 'toHaveBeenCalledWith' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(137,22): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/mockSession.ts(142,21): error TS2339: Property 'toHaveBeenCalled' does not exist on type 'Assertion'.
src/test/helpers/renderWithProviders.tsx(2,24): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/test/helpers/renderWithProviders.tsx(3,50): error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.
src/test/helpers/renderWithProviders.tsx(4,31): error TS2307: Cannot find module 'next-themes' or its corresponding type declarations.
src/test/helpers/renderWithProviders.tsx(5,25): error TS2307: Cannot find module 'sonner' or its corresponding type declarations.
src/test/helpers/renderWithProviders.tsx(78,15): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
src/test/helpers/testUtils.ts(1,92): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/test/helpers/userEvent.ts(1,23): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/test/helpers/userEvent.ts(2,32): error TS2307: Cannot find module '@testing-library/user-event' or its corresponding type declarations.
src/tests/mocks/purchaseOrder.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/tests/mocks/purchaseOrder.ts(2,10): error TS2724: '"@/types/validation/purchaseOrder"' has no exported member named 'PurchaseOrderFormData'. Did you mean 'PurchaseOrderData'?
src/tests/mocks/vendor.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/tests/mocks/vendor.ts(1,24): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/types/__tests__/tax.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/bankAccount.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/db/purchaseOrder.ts(1,18): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/types/enums.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/types/enums.ts(1,24): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/enums.ts(6,3): error TS2353: Object literal may only specify known properties, and 'PENDING' does not exist in type 'Record<InvoiceStatus, string>'.
src/types/enums.ts(38,11): error TS2322: Type '"PENDING"' is not assignable to type 'InvoiceStatus'.
src/types/enums.ts(41,14): error TS2322: Type '"PAID"' is not assignable to type 'InvoiceStatus'.
src/types/enums.ts(41,22): error TS2322: Type '"REJECTED"' is not assignable to type 'InvoiceStatus'.
src/types/enums.ts(60,3): error TS2353: Object literal may only specify known properties, and 'PENDING' does not exist in type 'Record<InvoiceStatus, string>'.
src/types/index.ts(3,15): error TS2305: Module '"./invoice"' has no exported member 'QualifiedInvoice'.
src/types/index.ts(3,38): error TS2305: Module '"./invoice"' has no exported member 'TaxableItem'.
src/types/itemCategory.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/itemCategory.ts(74,39): error TS2339: Property 'itemCategoryMaster' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/types/itemCategory.ts(84,39): error TS2339: Property 'itemCategoryMaster' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/types/order-status.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/order.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/purchase-order.ts(1,18): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrder'.
src/types/purchaseOrder.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/status-history.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/tag.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/tax.ts(2,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/tax.ts(4,10): error TS2724: '"@/types/base/tax"' has no exported member named 'ViewTaxCalculation'. Did you mean 'DbTaxCalculation'?
src/types/tax.ts(4,30): error TS2305: Module '"@/types/base/tax"' has no exported member 'ViewTaxSummary'.
src/types/tax.ts(35,4): error TS7006: Parameter 'rate' implicitly has an 'any' type.
src/types/validation/__tests__/bankInfo.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/base.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/commonValidation.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/commonValidation.test.ts(2,10): error TS2305: Module '"../commonValidation"' has no exported member 'commonValidation'.
src/types/validation/__tests__/invoice.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/invoice.test.ts(4,25): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/types/validation/__tests__/item.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/messages.test.ts(1,50): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/number.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/__tests__/number.test.ts(43,39): error TS2339: Property 'taxRate' does not exist on type '{ readonly quantity: any; readonly systemTaxRate: any; readonly defaultTaxRate: any; readonly positivePrice: any; }'.
src/types/validation/__tests__/number.test.ts(51,39): error TS2339: Property 'taxRate' does not exist on type '{ readonly quantity: any; readonly systemTaxRate: any; readonly defaultTaxRate: any; readonly positivePrice: any; }'.
src/types/validation/__tests__/number.test.ts(59,39): error TS2339: Property 'taxRate' does not exist on type '{ readonly quantity: any; readonly systemTaxRate: any; readonly defaultTaxRate: any; readonly positivePrice: any; }'.
src/types/validation/__tests__/number.test.ts(67,39): error TS2339: Property 'taxRate' does not exist on type '{ readonly quantity: any; readonly systemTaxRate: any; readonly defaultTaxRate: any; readonly positivePrice: any; }'.
src/types/validation/__tests__/number.test.ts(75,39): error TS2339: Property 'taxRate' does not exist on type '{ readonly quantity: any; readonly systemTaxRate: any; readonly defaultTaxRate: any; readonly positivePrice: any; }'.
src/types/validation/__tests__/tag.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/types/validation/authSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/authSchema.ts(2,10): error TS2305: Module '"./commonValidation"' has no exported member 'commonValidation'.
src/types/validation/authSchema.ts(32,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/authSchema.ts(70,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/bankInfo.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/bankInfo.ts(3,10): error TS2459: Module '"../common"' declares 'AccountType' locally, but it is not exported.
src/types/validation/base.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/commonValidation.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/invoice.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/invoice.ts(19,21): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/invoice.ts(22,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/invoice.ts(29,18): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/invoice.ts(31,21): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/invoice.ts(34,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/invoice.ts(79,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/invoiceSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/invoiceSchema.ts(2,10): error TS2305: Module '"./commonValidation"' has no exported member 'commonValidation'.
src/types/validation/invoiceSchema.ts(32,6): error TS7006: Parameter 'rate' implicitly has an 'any' type.
src/types/validation/item.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/item.ts(2,10): error TS2305: Module '"./commonValidation"' has no exported member 'commonValidation'.
src/types/validation/item.ts(19,21): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/item.ts(22,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/item.ts(29,18): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/item.ts(30,21): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/item.ts(33,16): error TS7006: Parameter 'val' implicitly has an 'any' type.
src/types/validation/messages.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/number.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/purchaseOrder.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/purchaseOrder.ts(4,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/validation/purchaseOrder.ts(38,3): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/purchaseOrder.ts(60,3): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/purchaseOrder.ts(92,27): error TS7006: Parameter 'err' implicitly has an 'any' type.
src/types/validation/purchaseOrderSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/purchaseOrderSchema.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PurchaseOrderStatus'.
src/types/validation/purchaseOrderSchema.ts(3,10): error TS2305: Module '"./commonValidation"' has no exported member 'commonValidation'.
src/types/validation/purchaseOrderSchema.ts(27,4): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/types/validation/tag.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/vendor.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/vendor.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'VendorCategory'.
src/types/validation/vendor.ts(2,26): error TS2305: Module '"@prisma/client"' has no exported member 'VendorStatus'.
src/types/validation/vendorSchema.ts(1,19): error TS2307: Cannot find module 'zod' or its corresponding type declarations.
src/types/validation/vendorSchema.ts(2,10): error TS2305: Module '"./commonValidation"' has no exported member 'commonValidation'.
src/utils/__tests__/calculations.test.ts(25,46): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(29,37): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(36,47): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(40,38): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(45,52): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(52,43): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(56,34): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/calculations.test.ts(63,22): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/calculations.test.ts(72,22): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(2,29): error TS2724: '"../formDataConverter"' has no exported member named 'convertFromFormData'. Did you mean 'convertToFormData'?
src/utils/__tests__/formDataConverter.test.ts(3,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/utils/__tests__/formDataConverter.test.ts(38,31): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(39,38): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(40,29): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(41,32): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(42,30): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(43,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(46,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(56,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(62,31): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(63,38): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(64,29): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(65,28): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(66,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(67,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(107,31): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(108,38): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(109,29): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(110,32): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(111,30): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(112,28): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(115,41): error TS2551: Property 'toBeInstanceOf' does not exist on type 'Assertion'. Did you mean 'instanceOf'?
src/utils/__tests__/formDataConverter.test.ts(116,39): error TS2551: Property 'toBeInstanceOf' does not exist on type 'Assertion'. Did you mean 'instanceOf'?
src/utils/__tests__/formDataConverter.test.ts(117,49): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(118,47): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(121,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(153,31): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(154,38): error TS2339: Property 'toBe' does not exist on type 'Assertion'.
src/utils/__tests__/formDataConverter.test.ts(157,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(167,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/formDataConverter.test.ts(178,31): error TS2551: Property 'toEqual' does not exist on type 'Assertion'. Did you mean 'equal'?
src/utils/__tests__/tagConverter.test.ts(3,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/utils/__tests__/typeConverters.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/utils/batch-processing.ts(182,19): error TS7053: Element implicitly has an 'any' type because expression of type 'PrismaTableName' can't be used to index type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
  Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/utils/batch-processing.ts(209,14): error TS7053: Element implicitly has an 'any' type because expression of type 'PrismaTableName' can't be used to index type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
  Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/utils/batch-processing.ts(233,14): error TS7053: Element implicitly has an 'any' type because expression of type 'PrismaTableName' can't be used to index type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
  Property 'purchaseOrder' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
src/utils/formDataConverter.ts(1,10): error TS2305: Module '"@/types/invoice"' has no exported member 'ExtendedInvoice'.
src/utils/formDataConverter.ts(1,27): error TS2305: Module '"@/types/invoice"' has no exported member 'InvoiceItem'.
src/utils/formDataConverter.ts(14,23): error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
src/utils/formDataConverter.ts(62,33): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/formDataConverter.ts(132,22): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/formDataConverter.ts(143,22): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/utils/formDataConverter.ts(167,50): error TS7006: Parameter 'tag' implicitly has an 'any' type.
src/utils/formDataConverter.ts(179,23): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/utils/testHelpers.ts(2,22): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
src/utils/testHelpers.ts(126,9): error TS7006: Parameter 'response' implicitly has an 'any' type.
src/utils/testHelpers.ts(160,42): error TS7006: Parameter 'c' implicitly has an 'any' type.
src/utils/testHelpers.ts(166,35): error TS7006: Parameter 'c' implicitly has an 'any' type.
src/utils/testHelpers.ts(222,26): error TS7006: Parameter 'c' implicitly has an 'any' type.
src/utils/typeConverters/__tests__/invoice.test.ts(1,38): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
src/utils/typeConverters/tax.ts(3,3): error TS2724: '"@/types/base/tax"' has no exported member named 'ViewTaxCalculation'. Did you mean 'DbTaxCalculation'?
src/utils/typeConverters/tax.ts(5,3): error TS2305: Module '"@/types/base/tax"' has no exported member 'ViewTaxSummary'.
src/utils/typeConverters/tax.ts(23,3): error TS2353: Object literal may only specify known properties, and 'rate' does not exist in type 'DbTaxCalculation'.
src/utils/typeConverters/tax.ts(33,12): error TS2339: Property 'rate' does not exist on type 'DbTaxCalculation'.
src/utils/typeConverters/tax.ts(34,15): error TS2339: Property 'taxRate' does not exist on type 'DbTaxCalculation'.
src/utils/typeConverters/tax.ts(52,21): error TS2349: This expression is not callable.
  Type 'DbTaxCalculation' has no call signatures.
vitest.config.ts(1,30): error TS2307: Cannot find module 'vitest/config' or its corresponding type declarations.
vitest.config.ts(2,19): error TS2307: Cannot find module '@vitejs/plugin-react' or its corresponding type declarations.
vitest.setup.ts(2,61): error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
vitest.setup.ts(3,25): error TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
vitest.setup.ts(4,27): error TS2307: Cannot find module '@testing-library/jest-dom/matchers' or its corresponding type declarations.
vitest.setup.ts(65,37): error TS7006: Parameter 'query' implicitly has an 'any' type.
vitest.setup.ts(95,16): error TS2664: Invalid module name in augmentation, module 'vitest' cannot be found.
