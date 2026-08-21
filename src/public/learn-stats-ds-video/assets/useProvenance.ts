import { initializeTrrack, Registry } from '@trrack/core';
import { useMemo } from 'react';
import { ConfidenceAppState, ProvenanceStateModel } from './types';

const useProvenance = () => {
  const prov = useMemo(() => {
    const registry = Registry.create();

    const trrackSetStateAction = registry.register('setAppState', (state, nextAppState: ConfidenceAppState,) => {
        state.appState = structuredClone(nextAppState);
        return state;
      },
    );

    const trrackInst = initializeTrrack({
      registry,
      initialState: {
        appState: null,
      } satisfies ProvenanceStateModel,
    });

    return {
      actions: {
        trrackSetStateAction,
      },
      trrack: trrackInst,
    };
  }, []);

  return prov;
};

export type ProvenanceModel = ReturnType<typeof useProvenance>;

export default useProvenance;
