import './ConfidenceApp.css';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { StimulusParams } from '../../../store/types';

import type {
  ProvenanceStateModel,
  TutorialAction,
  TutorialAPI,
} from './types';

import useProvenance from './useProvenance';

type ConfidencePageId = 'guided-95' | 'app-only' | 'post-vm14' | 'guided-99' | 'guided-95-2' | 'guided-99-2';

interface ConfidenceAppParameters {
  pageId?: ConfidencePageId;

  taskId?: string;

  initialBeta?: number | null;
  initialB?: number | null;
  initialSE?: number;
  initialCurve?: 'off' | 'normal' | 't';
  initialCI?: 'off' | '.10' | '.05' | '.01';

  lowerAnswerId?: string;
  upperAnswerId?: string;
  lowerPrompt?: string;
  upperPrompt?: string;

  assetBasePath?: string;
}

const GUIDED_PAGE_CSS = `
  .guided-page {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 0 40px;
    box-sizing: border-box;
    color: #444;
    font-family: Arial, sans-serif;
  }

  .guided-section {
    padding: 14px 18px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
  }

  .guided-gray {
    background: #eee;
  }

  .guided-section h2 {
    margin: 8px 0 20px;
  }

  .guided-section p {
    font-size: 18px;
    line-height: 1.45;
  }

  .guided-bold {
    font-weight: 700;
  }

  .guided-step-title {
    margin-bottom: 18px;
    font-size: 20px !important;
  }

  .guided-step-img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 12px 0 28px;
  }

  .guided-answer-row {
    display: grid;
    grid-template-columns: minmax(220px, 300px) minmax(200px, 320px);
    gap: 20px;
    align-items: center;
    margin: 14px 0;
  }

  .guided-answer-row input {
    width: 100%;
    box-sizing: border-box;
    padding: 6px;
    font-size: 16px;
  }

  .confidence-app-container {
    width: 100%;
    height: auto;
    min-height: 0;
    margin: 16px 0 24px;
    overflow: visible;
  }

  .confidence-app-container > .app {
    width: 100%;
    height: auto;
    min-height: 0;
  }

  @media (max-width: 700px) {
    .guided-answer-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }
`;

function loadScript(source: string, id: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      id,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve(existingScript);
        return;
      }

      existingScript.addEventListener(
        'load',
        () => resolve(existingScript),
        { once: true },
      );

      existingScript.addEventListener(
        'error',
        () => reject(new Error(`Failed to load script: ${source}`)),
        { once: true },
      );

      return;
    }

    const script = document.createElement('script');

    script.id = id;
    script.src = source;
    script.async = false;

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve(script);
      },
      { once: true },
    );

    script.addEventListener(
      'error',
      () => reject(new Error(`Failed to load script: ${source}`)),
      { once: true },
    );

    document.body.appendChild(script);
  });
}

function App({
  parameters,
  setAnswer,
  provenanceState,
}: StimulusParams<ConfidenceAppParameters, ProvenanceStateModel>) {
  const { actions, trrack } = useProvenance();

  const pageId = parameters.pageId ?? 'guided-95';
  const taskId = parameters.taskId ?? pageId;
  const isGuided95Page = pageId === 'guided-95';

  const initialBeta =
    parameters.initialBeta === undefined
      ? isGuided95Page
        ? 1
        : null
      : parameters.initialBeta;

  const initialB =
    parameters.initialB === undefined
      ? isGuided95Page
        ? 1.1
        : null
      : parameters.initialB;

  const initialSE = parameters.initialSE ?? 1;
  const initialCurve =
    parameters.initialCurve ?? (isGuided95Page ? 'normal' : 'off');
  const initialCI = parameters.initialCI ?? 'off';

  const lowerAnswerId =
    parameters.lowerAnswerId ??
    (isGuided95Page
      ? 'guided_exploration_95_lower_bound'
      : undefined);

  const upperAnswerId =
    parameters.upperAnswerId ??
    (isGuided95Page
      ? 'guided_exploration_95_upper_bound'
      : undefined);

  const lowerPrompt =
    parameters.lowerPrompt ?? 'The value of the lower bound:';
  const upperPrompt =
    parameters.upperPrompt ?? 'The value of the upper bound:';

  const assetBasePath =
    parameters.assetBasePath ?? 'learn-stats-ds-video/assets';

  const [apiReady, setApiReady] = useState(false);
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');

  const answersRef = useRef({
    lowerBound: '',
    upperBound: '',
  });

  const isHydratingRef = useRef(false);
  const initialStateRecordedRef = useRef(false);
  const initialDefaultsAppliedRef = useRef(false);

  const assetPath = useCallback(
    (filename: string) =>
      `${import.meta.env.BASE_URL}${assetBasePath}/${filename}`,
    [assetBasePath],
  );

  const saveToRevisit = useCallback(() => {
    const answers: Record<string, string> = {};

    if (lowerAnswerId) {
      answers[lowerAnswerId] = answersRef.current.lowerBound;
    }

    if (upperAnswerId) {
      answers[upperAnswerId] = answersRef.current.upperBound;
    }

    const lowerComplete =
      !lowerAnswerId || answersRef.current.lowerBound.trim() !== '';
    const upperComplete =
      !upperAnswerId || answersRef.current.upperBound.trim() !== '';

    setAnswer({
      status: lowerComplete && upperComplete,
      answers,
      provenanceGraph: trrack.graph.backend,
    });
  }, [lowerAnswerId, setAnswer, trrack, upperAnswerId]);

  const handleLowerBoundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setLowerBound(value);
    answersRef.current.lowerBound = value;
    saveToRevisit();
  };

  const handleUpperBoundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setUpperBound(value);
    answersRef.current.upperBound = value;
    saveToRevisit();
  };

  useEffect(() => {
    setApiReady(false);
    setLowerBound('');
    setUpperBound('');

    answersRef.current = {
      lowerBound: '',
      upperBound: '',
    };

    initialStateRecordedRef.current = false;
    initialDefaultsAppliedRef.current = false;
  }, [taskId]);

  useEffect(() => {
    let cancelled = false;
    let activeAPI: TutorialAPI | undefined;
    let handleAction: ((event: TutorialAction) => void) | null = null;

    async function initializeConfidenceApp() {
      try {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
          'confidence-katex-script',
        );

        if (cancelled) {
          return;
        }

        await loadScript(
          'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
          'confidence-d3-script',
        );

        if (cancelled) {
          return;
        }

        activeAPI = window.tutorialAPI;

        const alreadyAttached =
          typeof activeAPI?.isAttached === 'function' &&
          activeAPI.isAttached();

        if (!alreadyAttached) {
          document.getElementById('confidence-app-script')?.remove();
          document.querySelectorAll('#chart svg').forEach((element) => {
            element.remove();
          });
          delete window.tutorialAPI;

          if (cancelled) {
            return;
          }

          const confidenceScript = document.createElement('script');
          confidenceScript.id = 'confidence-app-script';
          confidenceScript.src = `${import.meta.env.BASE_URL}learn-stats-ds-video/assets/ConfidenceApp.js`;
          confidenceScript.async = false;

          await new Promise<void>((resolve, reject) => {
            confidenceScript.addEventListener('load', () => resolve(), {
              once: true,
            });

            confidenceScript.addEventListener(
              'error',
              () => reject(new Error('Could not load ConfidenceApp.js')),
              { once: true },
            );

            document.body.appendChild(confidenceScript);
          });

          if (cancelled) {
            return;
          }

          activeAPI = window.tutorialAPI;
        }

        const api = activeAPI;

        if (!api) {
          throw new Error(
            'The script loaded, but window.tutorialAPI was not created.',
          );
        }

        if (typeof api.isAttached !== 'function' || !api.isAttached()) {
          throw new Error(
            'tutorialAPI is not connected to the visible confidence chart.',
          );
        }

        const ignoredActions = new Set([
          'dragStart',
          'drag',
          'dragBStart',
          'dragB',
          'dragBetaStart',
          'dragBeta',
          'dragBetaPrimeStart',
          'dragBetaPrime',
          'dragBetaPrimePrimeStart',
          'dragBetaPrimePrime',
          'dragAxisStart',
          'dragAxis',
        ]);

        handleAction = (event: TutorialAction) => {
          if (isHydratingRef.current || ignoredActions.has(event.action)) {
            return;
          }

          const nextState = api.getState();

          trrack.apply(
            event.action,
            actions.trrackSetStateAction(nextState),
          );

          saveToRevisit();
        };

        api.onAction(handleAction);
        setApiReady(true);
      } catch (error) {
        console.error('Could not initialize confidence application:', error);
      }
    }

    void initializeConfidenceApp();

    return () => {
      cancelled = true;

      if (handleAction && activeAPI) {
        activeAPI.offAction(handleAction);
      }
    };
  }, [actions, pageId, saveToRevisit, trrack]);

  useEffect(() => {
    if (!apiReady || provenanceState?.appState) {
      return;
    }

    if (initialDefaultsAppliedRef.current) {
      return;
    }

    const api = window.tutorialAPI;

    if (!api) {
      return;
    }

    const currentState = api.getState();

    api.setState({
      ...currentState,
      beta: initialBeta,
      b: initialB,
      se: initialSE,
      curve: initialCurve,
      ci: initialCI,
    });

    initialDefaultsAppliedRef.current = true;
  }, [
    apiReady,
    initialB,
    initialBeta,
    initialCI,
    initialCurve,
    initialSE,
    provenanceState,
  ]);

  useEffect(() => {
    if (!apiReady || provenanceState?.appState) {
      return;
    }

    if (
      initialStateRecordedRef.current ||
      !initialDefaultsAppliedRef.current
    ) {
      return;
    }

    const api = window.tutorialAPI;

    if (!api) {
      return;
    }

    const initialState = api.getState();

    trrack.apply(
      'initialConfidenceState',
      actions.trrackSetStateAction(initialState),
    );

    saveToRevisit();
    initialStateRecordedRef.current = true;
  }, [
    actions,
    apiReady,
    provenanceState,
    saveToRevisit,
    trrack,
  ]);

  useEffect(() => {
    if (!apiReady || !provenanceState?.appState) {
      return;
    }

    const api = window.tutorialAPI;

    if (!api) {
      return;
    }

    isHydratingRef.current = true;
    api.setState(provenanceState.appState);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isHydratingRef.current = false;
      });
    });
  }, [apiReady, provenanceState]);

  const renderConfidenceApplication = () => (
    <div className="confidence-app-container">
      <div className="app">
        {/* Controls */}
        <div className="row panel">
          {/* Row 1 */}
          <div className="row" style={{ gap: 16 }}>
            <input
              id="betaInput"
              type="number"
              step="0.1"
              defaultValue=""
              className="small-input"
            />

            <button
              id="betaBtn"
              className="primary"
              style={{ visibility: 'hidden' }}
              type="button"
            >
              Update
            </button>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span id="seLabel" style={{ fontSize: '1.2em' }}>
                SE
              </span>

              <input
                id="seInput"
                type="number"
                step="0.01"
                defaultValue="1"
                style={{ width: '45px' }}
              />

              <input
                id="seRange"
                type="range"
                min="0.1"
                max="5"
                step="0.05"
                defaultValue="1"
              />
            </label>

            <div className="dropdown-btn-wrap">
              <button id="regenBtn" className="primary" type="button">
                Simulate 1000x
              </button>

              <button
                id="regenDropdownBtn"
                className="primary dropdown-arrow"
                title="Simulation options"
                type="button"
              >
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div id="regenDropdown" className="dropdown-menu">
                <button data-n="1" type="button">
                  1x
                </button>
                <button data-n="10" type="button">
                  10x
                </button>
                <button data-n="100" type="button">
                  100x
                </button>
                <button data-n="1000" type="button">
                  1000x
                </button>
                <button data-action="clear" type="button">
                  Clear
                </button>
              </div>
            </div>

            <button
              id="secondDistBtn"
              className="icon-toggle"
              title="Toggle second distribution"
              type="button"
            >
              <span>β′</span>
            </button>

            <button
              id="thirdDistBtn"
              className="icon-toggle"
              title="Toggle third distribution"
              type="button"
            >
              <span>β″</span>
            </button>

            <div
              className="seg"
              id="powerSeg"
              title="Second distribution shading mode"
            >
              <button data-power="tails" className="active" type="button">
                Tails
              </button>
              <button data-power="power" type="button">
                Power
              </button>
            </div>

            <div style={{ flex: '1 1 auto' }} />

            <input
              id="bInput"
              type="number"
              step="0.01"
              defaultValue=""
              className="small-input"
            />

            <button
              id="bBtn"
              className="primary"
              style={{ visibility: 'hidden' }}
              type="button"
            >
              Update
            </button>
          </div>

          {/* Row 2 */}
          <div className="row" style={{ gap: '16px' }}>
            <label>
              Scale
              <input
                id="scaleRange"
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                defaultValue="1.75"
              />
            </label>

            <label>
              Bins
              <input
                id="binsRange"
                type="range"
                min="1"
                max="200"
                step="1"
                defaultValue="30"
              />
            </label>

            <div className="seg" id="curveSeg" title="Overlay curve">
              <button data-curve="off" className="active" type="button">
                Off
              </button>
              <button data-curve="normal" type="button">
                Z
              </button>
              <button data-curve="t" type="button">
                t
              </button>
            </div>

            <label>
              df
              <input
                id="dfInput"
                type="number"
                min="1"
                step="1"
                defaultValue="10"
                style={{ width: '60px' }}
              />
            </label>

            <div className="seg" id="ciSeg">
              <button data-ci="off" className="active" type="button">
                OFF
              </button>
              <button data-ci=".10" type="button">
                α=.10
              </button>
              <button data-ci=".05" type="button">
                α=.05
              </button>
              <button data-ci=".01" type="button">
                α=.01
              </button>
            </div>

            <button
              id="vertLinesBtn"
              className="icon-toggle"
              title="Toggle vertical CI lines"
              type="button"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <line
                  x1="7"
                  y1="2"
                  x2="7"
                  y2="18"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
                <line
                  x1="13"
                  y1="2"
                  x2="13"
                  y2="18"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
              </svg>
            </button>

            <button
              id="histogramBtn"
              className="icon-toggle"
              title="Toggle histogram/curve view"
              type="button"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <rect
                  x="2"
                  y="10"
                  width="3"
                  height="8"
                  fill="#60a5fa"
                  stroke="#1e4ed8"
                  strokeWidth="0.5"
                />
                <rect
                  x="6"
                  y="6"
                  width="3"
                  height="12"
                  fill="#60a5fa"
                  stroke="#1e4ed8"
                  strokeWidth="0.5"
                />
                <rect
                  x="10"
                  y="8"
                  width="3"
                  height="10"
                  fill="#60a5fa"
                  stroke="#1e4ed8"
                  strokeWidth="0.5"
                />
                <rect
                  x="14"
                  y="12"
                  width="3"
                  height="6"
                  fill="#60a5fa"
                  stroke="#1e4ed8"
                  strokeWidth="0.5"
                />
              </svg>
            </button>

            <button
              id="pValueBtn"
              className="icon-toggle"
              title="Toggle p-value display"
              type="button"
            >
              <span className="p-icon">p</span>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="svg-wrap" id="chart">
          <button
            id="btnMarkBound"
            className="overlay-btn hidden"
            type="button"
          >
            Mark Bound
          </button>

          <button
            id="btnMarkBound2"
            className="overlay-btn orange hidden"
            type="button"
          >
            Mark Bound
          </button>

          <button
            id="btnMarkBound3"
            className="overlay-btn orange hidden"
            type="button"
          >
            Mark Bound
          </button>

          <div id="legend" className="legend">
            <div className="legend-item">
              <div className="legend-color power" />
              <span>Power (1-β)</span>
            </div>

            <div className="legend-item">
              <div className="legend-color type2" />
              <span>Type II Error (β)</span>
            </div>
          </div>

          <div
            id="topAxisLabel"
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
            }}
          />

          <div
            id="bottomAxisLabel"
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
            }}
          />

          <div
            id="betaMarkerLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="bMarkerLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="betaPrimeMarkerLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="betaPrimePrimeMarkerLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="meanLineLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="meanLineLabel2"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="meanLineLabel3"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />

          <div
            id="pValueLabel"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              display: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderConfidenceIntervalInputs = (
    question = 'What is the confidence interval?',
  ) => (
    <div className="guided-answers">
      <p className="guided-step-title">{question}</p>

      <div className="guided-answer-row">
        <label htmlFor={`${taskId}-lower-bound`}>{lowerPrompt}</label>
        <input
          id={`${taskId}-lower-bound`}
          type="text"
          value={lowerBound}
          onChange={handleLowerBoundChange}
        />
      </div>

      <div className="guided-answer-row">
        <label htmlFor={`${taskId}-upper-bound`}>{upperPrompt}</label>
        <input
          id={`${taskId}-upper-bound`}
          type="text"
          value={upperBound}
          onChange={handleUpperBoundChange}
        />
      </div>
    </div>
  );

  const renderGuided95Page = () => (
    <div className="guided-page">
      <section className="guided-section">
        <p>
          A researcher is interested in understanding the average rating of a
          movie on a scale of -3 being extremely bad to 3 being extremely good.
          The researchers collected the rating from 100 people who just watched
          the movie in a cinema. The average rating is 1.1.
        </p>

        <p>
          In this activity, you will follow guided steps to construct two
          confidence intervals.
        </p>
      </section>

      <section className="guided-section guided-gray">
        <p>Context</p>

        <h2>Part 1: Construct a 95% confidence interval</h2>

        <p className="guided-bold">
          A confidence interval app is displayed after Step 5. Please follow
          the five steps to construct a 95% confidence interval for the average
          rating of a movie in the confidence interval app. After you finish
          your construction, review Steps 6 and 7 to see the correct solution.
          If your confidence interval is incorrect, revise your work in the
          confidence interval app based on the explanations provided in those
          steps.
        </p>

        <p className="guided-bold">
          Your activity in the app will be recorded. To receive extra credit,
          it is important that you complete all steps and fully engage with the
          activity.
        </p>
      </section>

      <section className="guided-section">
        <p className="guided-step-title">
          Step 1. In the app below, type in the b to 1.1, the sample mean, and
          click “Update b”.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-1.png')}
          alt="Step 1 instruction"
        />

        <p className="guided-step-title">
          Step 2. Type in an initial β of your choice and click “Update β”. For
          example, you can set the β to be 0. You will adjust this later.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-2.png')}
          alt="Step 2 instruction"
        />

        <p className="guided-step-title">
          Step 3. Click “N” to put a sampling distribution of b. Notice that
          currently the SE, standard error, is set to 1.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-3.png')}
          alt="Step 3 instruction"
        />

        <p className="guided-step-title">
          Step 4. Now you should see a sampling distribution in the app. Click
          the α to color the sampling distribution. Because we want to
          construct a 95% confidence interval, choose α = .05 to color the
          middle 95% of the sampling distribution.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-4.png')}
          alt="Step 4 instruction"
        />

        <p className="guided-step-title">
          Step 5. Click on the sampling distribution to move it to find the
          lower bound and upper bound of the confidence interval. Explore on
          your own before moving on to the next step.
        </p>

        <p className="guided-bold">
          Remember: the lower bound and upper bound of a confidence interval
          indicate the range of β1s that we would consider likely to have
          produced the sample b1s.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-5.png')}
          alt="Step 5 instruction"
        />
      </section>

      <section className="guided-section guided-gray">
        <p className="guided-bold">
          Now, construct the 95% confidence interval in the app below based on
          the five steps above. You can go back to review each step when
          constructing the confidence interval. After you finish, review Step 6
          and 7.
        </p>

        {renderConfidenceApplication()}

        {renderConfidenceIntervalInputs(
          'What is the 95% confidence interval?',
        )}
      </section>

    </div>
  );

  const renderGuided95Page2 = () => (
    <div className='guided-page'>
      <section className="guided-section">
        <p className="guided-step-title">
          Step 6. Mark the lower bound: this is the lowest value of β that will
          still make b = 1.1 likely. It does not need to be precisely the
          number.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-6.png')}
          alt="Step 6 instruction"
        />

        <p className="guided-step-title">
          Step 7. Mark the upper bound: this is the highest value of β that will
          still make b = 1.1 likely.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-7.png')}
          alt="Step 7 instruction"
        />

        {renderConfidenceApplication()}

        {renderConfidenceIntervalInputs(
          'What is the 95% confidence interval?',
        )}
      </section>
    </div>
  )

  const renderGuided99Page = () => (
    <div className="guided-page">
      <section className="guided-section guided-gray">
        <h2>
          Part 2: Construct a 99% confidence interval
        </h2>

        <p className="guided-bold">
          A confidence interval app is displayed under Step 2. After you finish your
          construction, review Steps 3 and 4 to see the correct solution. If your
          interval is incorrect, revise your work in the confidence interval app
          based on the explanations provided in those steps. Your activity in the
          app will be recorded. To receive extra credit, it is important that you
          complete all steps and fully engage with the activity.
        </p>
      </section>

      <section className="guided-section">
        <p className="guided-step-title">
          Step 1. Change the α value for a 99% confidence interval. Notice how the
          coloring of the sampling distribution changes when you change α from .05
          to .01.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-8.png')}
          alt="Step 1: change alpha to .01"
        />
      </section>

      <section className="guided-section">
        <p className="guided-step-title">
          Step 2. Move the sampling distribution to find the lower bound and upper
          bound of the 99% confidence interval.
        </p>

        <p className="guided-bold">
          Complete Step 1 and 2 in the app below.
        </p>

        {renderConfidenceApplication()}

        <div className="guided-answer-section">
          {renderConfidenceIntervalInputs(
            'What is the 99% confidence interval?',
          )}
        </div>
      </section>
    </div>
  );

  const renderGuided99Page2 = () => (
    <div className='guided-section'>
      <section className="guided-section">
        <p className="guided-step-title">
          Step 3. Mark the lower bound of the 99% confidence interval.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-9.png')}
          alt="Step 3: mark lower bound"
        />
      </section>

      <section className="guided-section">
        <p className="guided-step-title">
          Step 4. Mark the upper bound of the 99% confidence interval.
        </p>

        <img
          className="guided-step-img"
          src={assetPath('guided-step-10.png')}
          alt="Step 4: mark upper bound"
        />

        {renderConfidenceApplication()}

        <div className="guided-answer-section">
          {renderConfidenceIntervalInputs(
            'What is the 99% confidence interval?',
          )}
        </div>
      </section>


    </div>
  )

  const renderPostVM14Page = () => (
    <div className="guided-page">
      <section className="guided-section">
        {renderConfidenceApplication()}

        <div className="post-vm14-tips">
          <h3>
            Tips: To change standard error to 0.5:
          </h3>

          <img
            src={assetPath('post-vm14-tip.png')}
            alt="Instruction showing how to change the standard error to 0.5"
          />

          <p className="post-vm14-question-text">
            Notice how the scale changed as you changed the standard error of the
            sampling distribution. This is to help make the graph more readable.
            Change the Scale back by dragging the dot to the right to see how the
            sampling distribution is narrower, or less variable, after you changed
            standard error to 0.5.
          </p>

          <p className="post-vm14-question-text">
            What would happen to the sampling distribution if the standard error
            changes from 0.9 to 0.5? Does the sampling distribution become more or
            less variable?
          </p>
        </div>
      </section>
    </div>
  );

  const renderAppOnlyPage = () => (
    <div className="guided-page">
      <section className="guided-section">
        {renderConfidenceApplication()}
      </section>
    </div>
  );

  const renderSelectedPage = () => {
    switch (pageId) {
      case 'app-only':
        return renderAppOnlyPage();

      case 'guided-95':
        return renderGuided95Page();

      case 'guided-95-2': 
        return renderGuided95Page2();

      case 'post-vm14': 
        return renderPostVM14Page();
      
      case 'guided-99': 
        return renderGuided99Page();

      case 'guided-99-2':
        return renderGuided99Page2();

      default:
        return renderAppOnlyPage();
    }
  };

  return (
    <>
      <style>{GUIDED_PAGE_CSS}</style>
      {renderSelectedPage()}
    </>
  );
}

export default App;
