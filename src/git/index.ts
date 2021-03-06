#!/usr/bin/env node

import { Tagged } from "@effect-ts/core/Case"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"
import * as R from "@effect-ts/node/Runtime"

import * as Args from "@effect-ts/cli/Args"
import * as CliApp from "@effect-ts/cli/CliApp"
import * as Command from "@effect-ts/cli/Command"
import * as Exists from "@effect-ts/cli/Exists"
import * as Help from "@effect-ts/cli/Help"
import { putStrLn } from "@effect-ts/cli/Internal/Console"
import * as Options from "@effect-ts/cli/Options"

// -----------------------------------------------------------------------------
// Model
// -----------------------------------------------------------------------------

export type GitSubcommand = Add | Remote

export class Add extends Tagged("Add")<{
  readonly modified: boolean
  readonly directory: string
}> {}

export class Remote extends Tagged("Remote")<{
  readonly verbose: boolean
}> {}

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export function add(modified: boolean, directory: string): GitSubcommand {
  return new Add({ modified, directory })
}

export function remote(verbose: boolean): GitSubcommand {
  return new Remote({ verbose })
}

// -----------------------------------------------------------------------------
// Add Subcommand
// -----------------------------------------------------------------------------

export const modifiedFlag = Options.boolean("m")

const addOptions = modifiedFlag
const addArgs = Args.namedDirectory("directory", Exists.yes)
const addHelp = Help.p("Add subcommand description")

const addCommand = pipe(
  Command.make("add", addOptions, addArgs, addHelp),
  Command.map(({ tuple: [modified, directory] }) => add(modified, directory))
)

// -----------------------------------------------------------------------------
// Remote Subcommand
// -----------------------------------------------------------------------------

const verboseFlag = pipe(Options.boolean("verbose"), Options.alias("v"))

const remoteOptions = verboseFlag
const remoteArgs = Args.none
const remoteHelp = Help.p("Remote command description")

const remoteCommand = pipe(
  Command.make("remote", remoteOptions, remoteArgs, remoteHelp),
  Command.map(remote)
)

// -----------------------------------------------------------------------------
// Git Command
// -----------------------------------------------------------------------------

const gitCommand = pipe(
  Command.make("git", Options.none, Args.none),
  Command.subcommands(pipe(addCommand, Command.orElse(remoteCommand)))
)

// -----------------------------------------------------------------------------
// CLI Application
// -----------------------------------------------------------------------------

export const gitApp = CliApp.make({
  name: "Git Version Control",
  version: "0.9.2",
  summary: Help.text("a client for the git dvcs protocol"),
  command: gitCommand
})

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

pipe(
  T.succeedWith(() => process.argv.slice(2)),
  T.chain((args) =>
    pipe(
      gitApp,
      CliApp.run(
        args,
        matchTag({
          Add: ({ directory, modified }) =>
            putStrLn(
              `Executing 'git add ${directory}' with the modified flag set to ${modified}`
            ),
          Remote: ({ verbose }) =>
            putStrLn(`Executing 'git remote' with the verbose flag set to ${verbose}`)
        })
      )
    )
  ),
  R.runMain
)
