import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {echoMessages} from './command'
import {parseXmls} from './parser'

async function run(): Promise<void> {
  try {
    const xmlPath = core.getInput('xml_path', {required: true})
    const globOptions = {
      followSymbolicLinks:
        core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE'
    }
    const globber = await glob.create(xmlPath, globOptions)
    const files = await globber.glob()

    const annotations = await parseXmls(files)

    echoMessages(annotations)

    const errors = annotations.filter(annotation => {
      return annotation.severityLevel === 'error'
    })
    if (errors.length) {
      const unit = errors.length === 1 ? 'error' : 'errors'
      throw Error(`ktlint with ${errors.length} ${unit}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
