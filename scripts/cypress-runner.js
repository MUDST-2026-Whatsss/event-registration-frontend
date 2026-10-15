delete process.env.ELECTRON_RUN_AS_NODE

import cypress from 'cypress'

const isInteractive = process.argv.includes('--open')
const specIndex = process.argv.indexOf('--spec')
const options = specIndex >= 0 ? { spec: process.argv[specIndex + 1] } : {}

if (isInteractive) {
  cypress.open().catch((err) => {
    console.error(err)
    process.exit(1)
  })
} else {
  cypress.run(options).then((results) => {
    for (const run of results.runs ?? []) {
      for (const test of run.tests ?? []) {
        if (test.state === 'failed') console.error(`${test.title.join(' > ')}: ${test.displayError}`)
      }
    }
    if (results.totalFailed > 0 || results.status === 'failed') {
      process.exit(1)
    }
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
