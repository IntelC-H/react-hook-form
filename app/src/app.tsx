import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/basic/:mode" exact component={Basic} />
      <Route
        path="/validate-field-criteria"
        exact
        component={ValidateFieldCriteria}
      />
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
      <Route path="/conditionalField" exact component={ConditionalField} />
      <Route path="/reset" exact component={Reset} />
      <Route path="/setValue" exact component={SetValue} />
      <Route
        path="/SetValueCustomRegister"
        exact
        component={SetValueCustomRegister}
      />
      <Route path="/formState/:mode" exact component={FormState} />
      <Route
        path="/formStateWithSchema/:mode"
        exact
        component={FormStateWithSchema}
      />
      <Route path="/default-values" exact component={DefaultValues} />
      <Route path="/trigger-validation" exact component={TriggerValidation} />
      <Route
        path="/watch-default-values"
        exact
        component={WatchDefaultValues}
      />
    </Router>
  );
};

export default App;
