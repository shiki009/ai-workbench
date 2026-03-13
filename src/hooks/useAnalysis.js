import { useState, useCallback } from 'react';
import { analyzeVideo } from '../services/api.js';

const INITIAL_STEPS = {
  downloading: 'pending',
  transcribing: 'pending',
  analyzing: 'pending',
};

export function useAnalysis() {
  const [state, setState] = useState('idle');
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analyzedUrl, setAnalyzedUrl] = useState(null);

  const analyze = useCallback(async (url, apiKeys, provider) => {
    setAnalyzedUrl(url);
    setState('loading');
    setSteps(INITIAL_STEPS);
    setResult(null);
    setError(null);

    try {
      await analyzeVideo(url, apiKeys, provider, (event, data) => {
        switch (event) {
          case 'step':
            setSteps(prev => ({ ...prev, [data.step]: data.status }));
            break;
          case 'result':
            setResult(data);
            break;
          case 'done':
            setState('done');
            break;
          case 'error':
            setError({ message: data.message, code: data.code });
            setState('error');
            break;
        }
      });
    } catch (err) {
      setError({ message: err.message, code: 'unknown' });
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setSteps(INITIAL_STEPS);
    setResult(null);
    setError(null);
    setAnalyzedUrl(null);
  }, []);

  return { state, steps, result, error, analyzedUrl, analyze, reset };
}
