# Contributing to NABOME

Thank you for your interest in contributing to NABOME! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/nabome.git`
3. Add upstream remote: `git remote add upstream https://github.com/nabome/nabome.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(checkout): add guest checkout support

- Implement guest checkout flow
- Add temporary profile creation
- Update order creation logic

Closes #123
```

```
fix(api): resolve N+1 query in order cancellation

- Use batch queries instead of individual fetches
- Add variant map for efficient lookups
- Test with 100+ items

Fixes #456
```

## Coding Standards

### TypeScript

- Use strict mode
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions/primitives
- Add JSDoc comments for public functions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// Bad
function getUser(id: any): any {
  // Implementation
}
```

### React

- Use functional components with hooks
- Prefer hooks over class components
- Use `useMemo` for expensive computations
- Use `React.memo` for expensive components
- Keep components small and focused

```typescript
// Good
const ProductCard = React.memo(({ product }: { product: Product }) => {
  const price = useMemo(() => calculatePrice(product), [product]);
  return <div>{price}</div>;
});

// Bad
const ProductCard = ({ product }: { product: any }) => {
  return <div>{product.price}</div>;
};
```

### API Handlers

- Use proper TypeScript types
- Handle errors gracefully
- Use standardized response functions
- Add JSDoc documentation

```typescript
/**
 * Handles product listing requests
 * @param req - Incoming request
 * @param ctx - Request context
 * @returns Response with products and pagination
 */
export async function handleProductList(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  try {
    const products = await getProducts();
    return success({ products });
  } catch (error) {
    return serverError(error);
  }
}
```

### Database (Prisma)

- Use selective queries with `select`
- Avoid deep nested includes
- Use batch operations where possible
- Add indexes for common query patterns

```typescript
// Good
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
  where: { isActive: true },
});

// Bad
const products = await prisma.product.findMany({
  include: {
    variants: {
      include: {
        product: true,
        images: true,
      },
    },
  },
});
```

### Styling (TailwindCSS)

- Use utility classes
- Avoid inline styles
- Extract repeated patterns to components
- Use responsive prefixes

```typescript
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// Bad
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
```

## Testing

### Unit Tests

- Test pure functions
- Mock external dependencies
- Use descriptive test names
- Arrange-Act-Assert pattern

```typescript
describe('calculatePrice', () => {
  it('should calculate price with discount', () => {
    const product = { basePrice: 100, discount: 10 };
    const result = calculatePrice(product);
    expect(result).toBe(90);
  });
});
```

### E2E Tests

- Test critical user flows
- Use page objects for reusable elements
- Wait for elements before interaction
- Clean up test data

```typescript
test('user can complete checkout', async ({ page }) => {
  await page.goto('/checkout');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/order-confirmation');
});
```

## Pull Request Process

### Before Submitting

1. Update documentation if needed
2. Add/update tests
3. Run linter: `pnpm lint`
4. Run tests: `pnpm test`
5. Build project: `pnpm build`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Code Review Guidelines

- Be constructive and specific
- Focus on the code, not the person
- Suggest improvements, don't just point out problems
- Ask questions if something is unclear
- Approve when you're comfortable with the changes

## Review Checklist

- [ ] Code is readable and maintainable
- [ ] TypeScript types are correct
- [ ] Error handling is appropriate
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance considerations addressed
- [ ] Accessibility is maintained

## Common Issues to Avoid

### Security
- Never commit secrets or API keys
- Validate all user input
- Use parameterized queries
- Implement proper authentication/authorization

### Performance
- Avoid N+1 queries
- Use pagination for large datasets
- Implement caching where appropriate
- Optimize images and assets

### Maintainability
- Avoid magic numbers/strings
- Use descriptive variable names
- Keep functions small and focused
- Add comments for complex logic

## Getting Help

- Check existing documentation
- Search for similar issues/PRs
- Ask in team Slack channel
- Create a discussion for questions

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Team meetings

Thank you for contributing to NABOME! 🎉
