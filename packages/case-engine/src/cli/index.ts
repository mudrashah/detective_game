import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import pc from 'picocolors';
import { generateCase } from '../generator/caseGenerator.js';
import { CaseEngine } from '../engine/caseEngine.js';
import { SolvabilityValidator } from '../validator/solvabilityValidator.js';
import { CaseData } from '../types/index.js';

async function main() {
  const rl = readline.createInterface({ input, output });

  // Generate initial seeded case
  const seed = 1984;
  const caseData: CaseData = generateCase({ seed });
  const engine = new CaseEngine(caseData);

  // Also write the case JSON to disk
  try {
    const jsonPath = path.resolve(process.cwd(), 'case_echo_park.json');
    fs.writeFileSync(jsonPath, JSON.stringify(caseData, null, 2), 'utf-8');
  } catch (err) {
    // Ignore if running from nested path
  }

  const printHeader = () => {
    console.clear();
    console.log(
      pc.yellow(
        '╔══════════════════════════════════════════════════════════════════════════════════╗'
      )
    );
    console.log(
      pc.yellow('║') +
        pc.bold(
          pc.white('          METRO HOMICIDE DIVISION — LOS ANGELES POLICE SERVICE             ')
        ) +
        pc.yellow('║')
    );
    console.log(
      pc.yellow('║') +
        pc.cyan(`      INCIDENT FILE #${caseData.caseNumber.padEnd(20)} SEED: ${seed.toString().padEnd(28)}`) +
        pc.yellow('║')
    );
    console.log(
      pc.yellow('║') +
        pc.bold(pc.red(`      TITLE: "${caseData.title}"`.padEnd(80))) +
        pc.yellow('║')
    );
    console.log(
      pc.yellow(
        '╚══════════════════════════════════════════════════════════════════════════════════╝'
      )
    );
  };

  let running = true;

  while (running) {
    printHeader();
    const state = engine.getState();
    console.log(pc.dim(`\nStatus: 48-Hour Arraignment Clock Running | In-Game Date: Oct 19, 2026`));
    console.log(
      pc.dim(
        `Discovered Clues: ${state.discoveredEvidenceIds.length} | Accessible Locations: ${state.unlockedLocationIds.length} | Suspects/Witnesses: ${state.unlockedCharacterIds.length}`
      )
    );

    console.log(pc.bold('\n--- DETECTIVE DESK MENU ---'));
    console.log(pc.cyan('[1]') + ' Case File & Dispatch Briefing (911 call + ME Autopsy)');
    console.log(
      pc.cyan('[2]') +
        ` Evidence Locker (${state.discoveredEvidenceIds.length} items collected)`
    );
    console.log(
      pc.cyan('[3]') +
        ` Canvass Locations & Crime Scenes (${state.unlockedLocationIds.length} available)`
    );
    console.log(pc.cyan('[4]') + ' Crime Lab & Judicial Subpoena Requests');
    console.log(pc.cyan('[5]') + ' Suspect Interrogation Room (Question, pressure, break lies)');
    console.log(pc.cyan('[6]') + pc.magenta(' Run Solvability Proof (Automated Verification)'));
    console.log(pc.cyan('[7]') + pc.red(' Submit Indictment to District Attorney (Formal Accusation)'));
    console.log(pc.cyan('[8]') + ' Export Full Case JSON to disk');
    console.log(pc.cyan('[0]') + ' Exit');

    const choice = await rl.question(pc.bold('\nSelect desk action [0-8]: '));

    switch (choice.trim()) {
      case '1': {
        // Dispatch & Prelim
        console.clear();
        console.log(pc.bold(pc.yellow('\n=== 911 DISPATCH AUDIO LOG & ME PRELIMINARY REPORT ===\n')));
        console.log(pc.bold('Incident Time:      ') + caseData.dispatchReport.incidentTime);
        console.log(pc.bold('Reporting Party:    ') + caseData.dispatchReport.reportingParty);
        console.log(pc.bold('Responding Unit:    ') + caseData.dispatchReport.initialUnitDispatched);
        console.log(pc.bold('Dispatch Summary:   ') + caseData.dispatchReport.operatorNotes);
        console.log('\n' + pc.dim('─'.repeat(80)) + '\n');
        const coroner = caseData.evidence['ev_coroner_prelim'];
        console.log(pc.bold(pc.red(coroner.title)));
        console.log(coroner.description);
        await rl.question(pc.dim('\nPress Enter to return to desk...'));
        break;
      }

      case '2': {
        // Evidence locker
        console.clear();
        console.log(pc.bold(pc.yellow('\n=== EVIDENCE LOCKER ===\n')));
        for (let i = 0; i < state.discoveredEvidenceIds.length; i++) {
          const id = state.discoveredEvidenceIds[i];
          const clue = caseData.evidence[id];
          if (!clue) continue;
          console.log(
            pc.cyan(`[${i + 1}] `) +
              pc.bold(clue.title) +
              pc.dim(` (${clue.category.toUpperCase()})`)
          );
          console.log(pc.white(`    ${clue.description}`));
          if (clue.provesMotiveFor) {
            console.log(pc.green(`    * Establishes Legal Motive`));
          }
          if (clue.provesOpportunityFor || clue.disprovesAlibiFor) {
            console.log(pc.green(`    * Establishes Scene Opportunity / Shatters Alibi`));
          }
          if (clue.provesMeansFor) {
            console.log(pc.green(`    * Establishes Forensic Connection to Murder Weapon`));
          }
          console.log('');
        }
        await rl.question(pc.dim('\nPress Enter to return to desk...'));
        break;
      }

      case '3': {
        // Canvass locations
        console.clear();
        console.log(pc.bold(pc.yellow('\n=== LOS ANGELES LOCATIONS ===\n')));
        for (let i = 0; i < state.unlockedLocationIds.length; i++) {
          const locId = state.unlockedLocationIds[i];
          const loc = caseData.locations[locId];
          const visited = state.visitedLocationIds.includes(locId)
            ? pc.green('[CANVASSED]')
            : pc.yellow('[UNVISITED]');
          console.log(
            pc.cyan(`[${i + 1}] `) +
              pc.bold(loc.name) +
              ` ${visited}\n    ${pc.dim(loc.fictionalAddress + ' (' + loc.neighborhood + ')')}`
          );
        }
        console.log(pc.cyan('[0] Back'));
        const locChoice = await rl.question('\nSelect location to canvass/search: ');
        const locIdx = parseInt(locChoice.trim(), 10) - 1;
        if (locIdx >= 0 && locIdx < state.unlockedLocationIds.length) {
          const selectedLocId = state.unlockedLocationIds[locIdx];
          const searchRes = engine.searchLocation(selectedLocId);
          console.log(pc.bold(`\nArriving at ${searchRes.locationName}...`));
          console.log(pc.dim(searchRes.description));
          if (searchRes.foundEvidence.length > 0) {
            console.log(pc.green(`\nFound new evidence items:`));
            for (const feId of searchRes.foundEvidence) {
              console.log(pc.bold(`  + ${caseData.evidence[feId].title}`));
            }
          } else {
            console.log(pc.dim('\nNo new physical evidence recovered at this location.'));
          }
          if (searchRes.foundCharacters.length > 0) {
            console.log(pc.yellow(`\nIdentified persons of interest on site:`));
            for (const fcId of searchRes.foundCharacters) {
              console.log(pc.bold(`  * ${caseData.characters[fcId].name} (${caseData.characters[fcId].occupation})`));
            }
          }
          await rl.question(pc.dim('\nPress Enter to continue...'));
        }
        break;
      }

      case '4': {
        // Lab & Subpoena
        console.clear();
        console.log(pc.bold(pc.yellow('\n=== CRIME LAB & JUDICIAL SUBPOENA DESK ===\n')));
        console.log(
          pc.cyan('[1]') + ' Send Recovered Weapon to Crime Lab for Ballistics/AFIS Fingerprints'
        );
        console.log(
          pc.cyan('[2]') + ' Subpoena LA City DOT Traffic Camera Footage (Glendale & Park Ave)'
        );
        console.log(
          pc.cyan('[3]') + ' Request Emergency CSLI Cell Tower Warrant for Raymond Calderon'
        );
        console.log(pc.cyan('[0]') + ' Back');

        const subChoice = await rl.question('\nSelect request: ');
        if (subChoice.trim() === '1') {
          const res = engine.requestForensicLab('ev_culvert_weapon');
          if (res.success) {
            console.log(pc.green(`\nSUCCESS: ${res.message}`));
            if (res.unlockedEvidenceId) {
              console.log(
                pc.bold(`Unlocked: ${caseData.evidence[res.unlockedEvidenceId].title}`)
              );
            }
          } else {
            console.log(pc.red(`\nFAILED: ${res.message}`));
          }
          await rl.question(pc.dim('\nPress Enter to continue...'));
        } else if (subChoice.trim() === '2') {
          const res = engine.requestSubpoena('cctv_park_ave');
          if (res.success) {
            console.log(pc.green(`\nSUCCESS: ${res.message}`));
            if (res.unlockedEvidenceId) {
              console.log(
                pc.bold(`Unlocked: ${caseData.evidence[res.unlockedEvidenceId].title}`)
              );
            }
          } else {
            console.log(pc.red(`\nDENIED: ${res.message}`));
          }
          await rl.question(pc.dim('\nPress Enter to continue...'));
        } else if (subChoice.trim() === '3') {
          const res = engine.requestSubpoena('calderon_cell_ping');
          if (res.success) {
            console.log(pc.green(`\nSUCCESS: ${res.message}`));
            if (res.unlockedEvidenceId) {
              console.log(
                pc.bold(`Unlocked: ${caseData.evidence[res.unlockedEvidenceId].title}`)
              );
            }
          } else {
            console.log(pc.red(`\nDENIED: ${res.message}`));
          }
          await rl.question(pc.dim('\nPress Enter to continue...'));
        }
        break;
      }

      case '5': {
        // Suspect interrogation
        console.clear();
        console.log(pc.bold(pc.yellow('\n=== INTERROGATION ROOM ===\n')));
        const chars = state.unlockedCharacterIds
          .map((id) => caseData.characters[id])
          .filter((c) => c.role !== 'victim');

        for (let i = 0; i < chars.length; i++) {
          const c = chars[i];
          const session = engine.getOrCreateInterrogationSession(c.id);
          const status = session.isLawyerInvoked
            ? pc.red('[LAWYER INVOKED - LOCKED]')
            : pc.green(`[Trust: ${session.trust}% | Pressure: ${session.pressure}%]`);
          console.log(
            pc.cyan(`[${i + 1}] `) +
              pc.bold(c.name) +
              ` (${c.occupation}) ${status}`
          );
        }
        console.log(pc.cyan('[0] Back'));

        const charChoice = await rl.question('\nSelect person to interrogate: ');
        const charIdx = parseInt(charChoice.trim(), 10) - 1;
        if (charIdx >= 0 && charIdx < chars.length) {
          const targetChar = chars[charIdx];
          let inRoom = true;

          while (inRoom) {
            const session = engine.getOrCreateInterrogationSession(targetChar.id);
            console.clear();
            console.log(
              pc.bold(
                pc.yellow(`\n=== INTERROGATION: ${targetChar.name.toUpperCase()} ===\n`)
              )
            );
            console.log(pc.dim(`Bio: ${targetChar.bio}`));
            console.log(
              pc.bold(
                `Trust: ${session.trust}/100 | Pressure: ${session.pressure}/100 | Lawyer Threshold: ${targetChar.lawyerThreshold}/100`
              )
            );
            if (session.isLawyerInvoked) {
              console.log(
                pc.red(
                  '\nWARNING: Suspect has invoked their 5th Amendment right to counsel. Questioning is barred.'
                )
              );
              await rl.question(pc.dim('\nPress Enter to return...'));
              inRoom = false;
              break;
            }

            console.log(pc.bold('\nAvailable Questions / Topics:'));
            for (let i = 0; i < session.unlockedTopicIds.length; i++) {
              const tId = session.unlockedTopicIds[i];
              const t = caseData.interrogationTopics[tId];
              const isBroken = session.brokenTopicIds.includes(tId);
              const tag = isBroken
                ? pc.green('[LIE BROKEN / CONFESSED]')
                : session.askedTopicIds.includes(tId)
                  ? pc.yellow('[ASKED]')
                  : pc.cyan('[NEW]');
              console.log(pc.cyan(`[${i + 1}] `) + pc.bold(t.prompt) + ` ${tag}`);
            }
            console.log(pc.cyan('[0] Leave interrogation room'));

            const topicChoice = await rl.question('\nSelect topic to press: ');
            const tIdx = parseInt(topicChoice.trim(), 10) - 1;
            if (tIdx >= 0 && tIdx < session.unlockedTopicIds.length) {
              const selectedTopicId = session.unlockedTopicIds[tIdx];
              const topicObj = caseData.interrogationTopics[selectedTopicId];

              // Ask the topic
              const askRes = engine.askTopic(targetChar.id, selectedTopicId);
              console.log(pc.bold(`\nDETECTIVE: `) + pc.white(`"${topicObj.prompt}"`));
              console.log(
                pc.bold(`${targetChar.name.toUpperCase()}: `) +
                  pc.italic(`"${askRes.statement}"`)
              );

              if (askRes.lawyerCalled) {
                console.log(
                  pc.red(
                    `\nSUSPECT INVOKED RIGHT TO COUNSEL! Pressure reached ${session.pressure}. Interrogation ended.`
                  )
                );
                await rl.question(pc.dim('\nPress Enter to continue...'));
                inRoom = false;
                break;
              }

              // Option to present evidence to contradict this statement
              if (!session.brokenTopicIds.includes(selectedTopicId)) {
                console.log(pc.bold('\nDo you want to present contradictory evidence to break this statement?'));
                console.log(pc.cyan('[1] Yes, present evidence'));
                console.log(pc.cyan('[2] No, back to topics'));
                const presChoice = await rl.question('Choice: ');

                if (presChoice.trim() === '1') {
                  console.log(pc.bold('\nSelect evidence to confront suspect with:'));
                  for (let e = 0; e < state.discoveredEvidenceIds.length; e++) {
                    const eId = state.discoveredEvidenceIds[e];
                    console.log(
                      pc.cyan(`[${e + 1}] `) + pc.bold(caseData.evidence[eId].title)
                    );
                  }
                  const eChoice = await rl.question('\nSelect evidence item: ');
                  const eIdx = parseInt(eChoice.trim(), 10) - 1;
                  if (eIdx >= 0 && eIdx < state.discoveredEvidenceIds.length) {
                    const chosenClueId = state.discoveredEvidenceIds[eIdx];
                    const confrontRes = engine.confrontWithEvidence(
                      targetChar.id,
                      selectedTopicId,
                      chosenClueId
                    );
                    if (confrontRes.success) {
                      console.log(pc.green(pc.bold('\nLIE SHATTERED! Suspect cracked:')));
                      console.log(pc.italic(`"${confrontRes.response}"`));
                      if (confrontRes.unlockedClues.length > 0) {
                        console.log(pc.green('\nUnlocked new documents/evidence:'));
                        for (const uc of confrontRes.unlockedClues) {
                          console.log(pc.bold(`  * ${caseData.evidence[uc].title}`));
                        }
                      }
                    } else {
                      console.log(
                        pc.red(
                          pc.bold('\nFAILED CONFRONTATION! Suspect rejected the claim:')
                        )
                      );
                      console.log(pc.italic(`"${confrontRes.response}"`));
                      console.log(
                        pc.yellow(
                          `Pressure increased (+18) to ${session.pressure}! Careful, high pressure without proof causes suspects to invoke a lawyer.`
                        )
                      );
                    }
                    if (confrontRes.lawyerCalled) {
                      console.log(
                        pc.red(
                          `\nSUSPECT INVOKED RIGHT TO COUNSEL! Pressure hit threshold. Interrogation terminated.`
                        )
                      );
                      inRoom = false;
                    }
                    await rl.question(pc.dim('\nPress Enter to continue...'));
                  }
                }
              } else {
                await rl.question(pc.dim('\nPress Enter to continue...'));
              }
            } else {
              inRoom = false;
            }
          }
        }
        break;
      }

      case '6': {
        // Solvability Validator
        console.clear();
        console.log(pc.bold(pc.magenta('\n=== AUTOMATED SOLVABILITY VALIDATOR ===\n')));
        console.log(pc.dim('Simulating optimal detective agent on case graph...\n'));
        const report = SolvabilityValidator.validateSolvability(caseData);

        console.log(pc.bold(`Case Solvability: `) + (report.solvable ? pc.green('100% SOLVABLE') : pc.red('UNSOLVABLE / FLAWED')));
        console.log(pc.bold(`True Culprit:    `) + pc.yellow(report.culpritName) + ` (${report.culpritId})`);
        console.log(pc.bold(`Reachable Clues: `) + `${report.reachableEvidenceIds.length}`);
        console.log(pc.bold(`Lies Broken:     `) + `${report.brokenLieIds.length}`);
        console.log(pc.bold(`Legal Pillars Established:`));
        console.log(`  - Motive:      ` + (report.pillarsEstablished.motive ? pc.green('YES') : pc.red('NO')));
        console.log(`  - Opportunity: ` + (report.pillarsEstablished.opportunity ? pc.green('YES') : pc.red('NO')));
        console.log(`  - Means:       ` + (report.pillarsEstablished.means ? pc.green('YES') : pc.red('NO')));

        console.log(pc.bold('\nCritical Path Trace:'));
        for (const cp of report.criticalPath) {
          console.log(`  -> ${pc.cyan(cp)}`);
        }

        if (report.errors.length > 0) {
          console.log(pc.red(pc.bold('\nValidation Errors:')));
          for (const err of report.errors) {
            console.log(pc.red(`  ! ${err}`));
          }
        } else {
          console.log(pc.green(pc.bold('\nVerification Passed: Culprit is provable beyond a reasonable doubt with zero ambiguities.')));
        }

        await rl.question(pc.dim('\nPress Enter to return to desk...'));
        break;
      }

      case '7': {
        // Indictment
        console.clear();
        console.log(pc.bold(pc.red('\n=== FORMAL ARRAIGNMENT & INDICTMENT SUBMISSION ===\n')));
        console.log(
          pc.yellow(
            'WARNING: Once submitted to the District Attorney, the indictment is final.\n' +
              'You must supply proof for all 3 legal pillars (Motive, Opportunity, Means).\n' +
              'A false accusation will end your career.'
          )
        );

        const suspects = Object.values(caseData.characters).filter((c) => c.role !== 'victim');
        console.log(pc.bold('\nSelect accused suspect:'));
        for (let i = 0; i < suspects.length; i++) {
          console.log(pc.cyan(`[${i + 1}] `) + pc.bold(suspects[i].name));
        }
        const sChoice = await rl.question('Accused: ');
        const sIdx = parseInt(sChoice.trim(), 10) - 1;
        if (sIdx < 0 || sIdx >= suspects.length) break;
        const accusedChar = suspects[sIdx];

        console.log(pc.bold('\nSelect evidence establishing MOTIVE:'));
        for (let i = 0; i < state.discoveredEvidenceIds.length; i++) {
          const eId = state.discoveredEvidenceIds[i];
          console.log(pc.cyan(`[${i + 1}] `) + caseData.evidence[eId].title);
        }
        const mChoice = await rl.question('Motive Evidence: ');
        const mIdx = parseInt(mChoice.trim(), 10) - 1;
        if (mIdx < 0 || mIdx >= state.discoveredEvidenceIds.length) break;
        const motiveEvidenceId = state.discoveredEvidenceIds[mIdx];

        console.log(pc.bold('\nSelect evidence establishing OPPORTUNITY (presence at scene / TOD alibi collapse):'));
        for (let i = 0; i < state.discoveredEvidenceIds.length; i++) {
          const eId = state.discoveredEvidenceIds[i];
          console.log(pc.cyan(`[${i + 1}] `) + caseData.evidence[eId].title);
        }
        const oChoice = await rl.question('Opportunity Evidence: ');
        const oIdx = parseInt(oChoice.trim(), 10) - 1;
        if (oIdx < 0 || oIdx >= state.discoveredEvidenceIds.length) break;
        const oppEvidenceId = state.discoveredEvidenceIds[oIdx];

        console.log(pc.bold('\nSelect evidence establishing MEANS (murder weapon forensic link):'));
        for (let i = 0; i < state.discoveredEvidenceIds.length; i++) {
          const eId = state.discoveredEvidenceIds[i];
          console.log(pc.cyan(`[${i + 1}] `) + caseData.evidence[eId].title);
        }
        const wChoice = await rl.question('Means Evidence: ');
        const wIdx = parseInt(wChoice.trim(), 10) - 1;
        if (wIdx < 0 || wIdx >= state.discoveredEvidenceIds.length) break;
        const meansEvidenceId = state.discoveredEvidenceIds[wIdx];

        const accusationResult = engine.submitAccusation({
          accusedCharacterId: accusedChar.id,
          motiveEvidenceId,
          opportunityEvidenceId: oppEvidenceId,
          meansEvidenceId
        });

        console.clear();
        if (accusationResult.success) {
          console.log(pc.green(pc.bold('\n' + '='.repeat(80))));
          console.log(pc.green(pc.bold(`  ${accusationResult.headline}`)));
          console.log(pc.green(pc.bold('='.repeat(80))));
          console.log(pc.white(`\n${accusationResult.detailedAnalysis}`));
        } else {
          console.log(pc.red(pc.bold('\n' + '='.repeat(80))));
          console.log(pc.red(pc.bold(`  ${accusationResult.headline}`)));
          console.log(pc.red(pc.bold('='.repeat(80))));
          console.log(pc.white(`\n${accusationResult.detailedAnalysis}`));
          if (accusationResult.flaws.length > 0) {
            console.log(pc.yellow('\nProsecutorial Deficiencies:'));
            for (const f of accusationResult.flaws) {
              console.log(pc.yellow(`  * ${f}`));
            }
          }
        }

        await rl.question(pc.dim('\nPress Enter to continue...'));
        break;
      }

      case '8': {
        const outPath = path.resolve(process.cwd(), 'case_echo_park.json');
        fs.writeFileSync(outPath, JSON.stringify(caseData, null, 2), 'utf-8');
        console.log(pc.green(`\nCase JSON exported successfully to: ${outPath}`));
        await rl.question(pc.dim('\nPress Enter to continue...'));
        break;
      }

      case '0':
        running = false;
        break;

      default:
        break;
    }
  }

  rl.close();
  console.log(pc.yellow('\nMetro Homicide Terminal signed off.\n'));
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});

