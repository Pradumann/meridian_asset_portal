export const roleTypes = {
    admin: 'admin',
    manager: 'manager',
    operator: 'operator'
} as const

export type RoleType = typeof roleTypes[keyof typeof roleTypes]

export const operatorTypes = {
    individual: 'individual',
    developer: 'developer'
} as const

export type OperatorType = typeof operatorTypes[keyof typeof operatorTypes]

export const propertyTypes = {
    familyHouse: 'familyHouse',
    commercial: 'commercial'
} as const

export type PropertyType = typeof propertyTypes[keyof typeof propertyTypes]
