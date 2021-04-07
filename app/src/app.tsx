import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AutoUnregister from './autoUnregister';
import Basic from './basic';
import Watch from './watch';
import BasicSchemaValidation from './basicSchemaValidation';
import SetError from './setError';
import SetValue from './setValue';
import FormState from './formState';
import ManualRegisterForm from './manualRegisterForm';
import DefaultValues from './defaultValues';
import WatchDefaultValues from './watchDefaultValues';
import Reset from './reset';
import TriggerValidation from './triggerValidation';
import ReValidateMode from './reValidateMode';
import ValidateFieldCriteria from './validateFieldCriteria';
import SetValueCustomRegister from './setValueCustomRegister';
import ConditionalField from './conditionalField';
import FormStateWithSchema from './formStateWithSchema';
import SetValueWithSchema from './setValueWithSchema';
import SetValueWithTrigger from './setValueWithTrigger';
import IsValid from './isValid';
import Controller from './controller';
import UseFieldArray from './useFieldArray';
import UseFieldArrayNested from './useFieldArrayNested';
import CustomSchemaValidation from './customSchemaValidation';
import WatchFieldArray from './watchUseFieldArray';
import UseWatch from './useWatch';
import FormStateWithNestedFields from './formStateWithNestedFields';
import UseFieldArrayUnregister from './useFieldArrayUnregister';
import WatchUseFieldArrayNested from './watchUseFieldArrayNested';
import UseWatchUseFieldArrayNested from './useWatchUseFieldArrayNested';
import Test from './test';
import Welcome from './welcome';
import { UseFormState } from './useFormState';

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/basic/:mode" exact component={Basic} />
      <Route
        path="/validate-field-criteria"
        exact
        component={ValidateFieldCriteria}
      />
      <Route path="/controller/:mode" exact component={Controller} />
      <Route
        path="/re-validate-mode/:mode/:reValidateMode"
        exact
        component={ReValidateMode}
      />
      <Route
        path="/manual-register-form"
        exact
        component={ManualRegisterForm}
      />
      <Route path="/watch" exact component={Watch} />
      <Route
        path="/basic-schema-validation/:mode"
        exact
        component={BasicSchemaValidation}
      />
      <Route path="/setError" exact component={SetError} />
      <Route
        path="/setValueWithTrigger"
        exact
        component={SetValueWithTrigger}
      />
      <Route path="/conditionalField" exact component={ConditionalField} />
      <Route path="/UseFieldArray/:mode" exact component={UseFieldArray} />
      <Route
        path="/UseFieldArrayUnregister"
        exact
        component={UseFieldArrayUnregister}
      />
      <Route path="/reset" exact component={Reset} />
      <Route path="/setValue" exact component={SetValue} />
      <Route path="/setValueWithSchema" exact component={SetValueWithSchema} />
      <Route
        path="/SetValueCustomRegister"
        exact
        component={SetValueCustomRegister}
      />
      <Route path="/formState/:mode" exact component={FormState} />
      <Route
        path="/formStateWithNestedFields/:mode"
        exact
        component={FormStateWithNestedFields}
      />
      <Route
        path="/formStateWithSchema/:mode"
        exact
        component={FormStateWithSchema}
      />
      <Route path="/isValid/:mode/:defaultValues" exact component={IsValid} />
      <Route path="/default-values" exact component={DefaultValues} />
      <Route path="/trigger-validation" exact component={TriggerValidation} />
      <Route
        path="/watch-default-values"
        exact
        component={WatchDefaultValues}
      />
      <Route path="/watch-field-array/:mode" component={WatchFieldArray} />
      <Route
        path="/customSchemaValidation/:mode"
        exact
        component={CustomSchemaValidation}
      />
      <Route path="/autoUnregister" exact component={AutoUnregister} />
      <Route path="/useWatch" exact component={UseWatch} />
      <Route path="/useFormState" exact component={UseFormState} />
      <Route
        path="/useFieldArrayNested"
        exact
        component={UseFieldArrayNested}
      />
      <Route
        path="/watchUseFieldArrayNested"
        exact
        component={WatchUseFieldArrayNested}
      />
      <Route
        path="/useWatchUseFieldArrayNested"
        exact
        component={UseWatchUseFieldArrayNested}
      />
      <Route path="/test" exact component={Test} />
      <Route path="/" exact component={Welcome} />
    </Router>
  );
};

export default App;
