<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <RouterLink class="app-footer__brand" to="/">Eventsss</RouterLink>

      <nav class="app-footer__links" aria-label="Support links">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#support">Contact Support</a>
      </nav>

      <p class="app-footer__copyright">© 2026 Eventsss Registration Platform. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  min-height: 66px;
  align-items: center;
  background: var(--neutral-0);
  border-top: 1px solid var(--color-border);
}

.app-footer__inner {
  display: grid;
  width: 100%;
  padding-inline: 42px;
  align-items: center;
  grid-template-columns: 218px minmax(0, 1fr) auto;
  gap: 24px;
}

.app-footer__brand {
  justify-self: start;
  color: var(--neutral-950);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.app-footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px 20px;
}

.app-footer__links a {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-decoration: none;
}

.app-footer__links a:hover {
  color: var(--brand-blue-strong);
}

.app-footer__copyright {
  justify-self: end;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-align: right;
}

@media (max-width: 820px) {
  .app-footer {
    padding-block: 20px;
  }

  .app-footer__inner {
    padding-inline: 16px;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 14px;
  }

  .app-footer__copyright {
    justify-self: center;
    text-align: center;
  }

  .app-footer__brand {
    justify-self: center;
  }
}

</style>
