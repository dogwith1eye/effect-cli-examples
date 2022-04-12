#!/usr/bin/env node

import { pipe } from "@effect-ts/core/Function"
import * as R from "@effect-ts/node/Runtime"

import * as Args from "@effect-ts/cli/Args"
import * as CliApp from "@effect-ts/cli/CliApp"
import * as Command from "@effect-ts/cli/Command"
import * as Help from "@effect-ts/cli/Help"
import { putStrLn } from "@effect-ts/cli/Internal/Console"
import * as Options from "@effect-ts/cli/Options"

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

const afterFlag = pipe(Options.integer("after"), Options.alias("A"))

const beforeFlag = pipe(Options.integer("before"), Options.alias("B"))

const grepOptions = Options.tuple(afterFlag, beforeFlag)

const grepArgs = Args.text

const grepCommand = Command.make("grep", grepOptions, grepArgs)

// -----------------------------------------------------------------------------
// Application
// -----------------------------------------------------------------------------

const grepApp = CliApp.make({
  name: "Grep",
  version: "0.1.0",
  summary: Help.text("Simple grep"),
  command: grepCommand
})

// -----------------------------------------------------------------------------
// Program
// -----------------------------------------------------------------------------

pipe(
  grepApp,
  CliApp.run(process.argv.slice(2), ({ tuple: [after, before] }) =>
    putStrLn(`Called grep with after set to ${after} and before set to ${before}`)
  ),
  R.runMain
)
