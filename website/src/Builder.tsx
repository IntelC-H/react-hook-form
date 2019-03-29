import React, { useState, useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import useForm from 'react-hook-form';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import styled from 'styled-components';
import colors from './styles/colors';
import SortableContainer from './SortableContainer';
import { SubHeading, HeadingWithTopMargin, Error, Title } from './styles/typography';
import { setHomePage } from './ButtonGroup';
import SyntaxHighlighterWithCopy from './SyntaxHighlighterWithCopy';

const errorStyle = { border: `1px solid ${colors.secondary}`, background: colors.errorPink };

const Root = styled.main`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #0e101c;
  z-index: 4;
  color: white;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  & pre,
  & code {
    font-size: 14px;
    text-align: left;
    color: white;
    overflow-x: auto;
    overflow-y: hidden;
    line-height: 1.3;
    white-space: pre-wrap;
    word-wrap: break-word;
    background: none !important;
  }
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  grid-column-gap: 60px;
  overflow: hidden;
  margin-bottom: 100px;
  padding: 20px 20px 100px 20px;

  & > div:first-child {
    margin-top: 50px;
    order: 3;
  }

  & > form:nth-child(2) {
    order: 1;
  }

  & > div:nth-child(3) {
    order: 2;
  }

  @media (min-width: 768px) {
    & > div:first-child {
      margin-top: 0;
      order: 1;
    }

    & > form:nth-child(2) {
      order: 2;
    }

    & > div:nth-child(3) {
      order: 3;
    }
  }
`;

const SubmitButton = styled.input`
  margin-top: 30px;
  height: 55px;
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  background: ${props => props.background || colors.lightPink};
  color: ${props => props.color || 'white'};
  border: none;
`;

const Form = styled.form`
  & fieldset {
    border-radius: 4px;
    border: 1px solid #6a6b7f;
    display: flex;
    padding: 10px 20px;
  }

  & fieldset > input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    border: 1px solid white;
    padding: 10px 15px;
    margin-bottom: 10px;
    font-size: 14px;

    &:hover {
      border: 1px solid ${colors.lightPink};
    }
  }

  & label {
    line-height: 2;
    text-align: left;
    display: block;
    margin-bottom: 13px;
    margin-top: 20px;
  }
`;

const CloseButton = styled.button`
  font-size: 30px;
  top: 0;
  right: 0;
  padding: 20px;
  position: absolute;
  cursor: pointer;
  border: none;
  font-weight: 200;
  z-index: 5;
  border-radius: 10px;
  color: white;
  background: rgba(14, 16, 28, 0.5294117647058824);

  @media (min-width: 768px) {
    font-size: 35px;
    padding: 20px;
    top: 15px;
    right: 20px;
  }
`;

function Builder({
  formData,
  updateFormData,
  showBuilder,
  toggleBuilder,
  editFormData,
  setFormData,
  builderButton,
  HomeRef,
  isMobile,
}) {
  const { register, handleSubmit, errors = {}, watch } = useForm();
  const [editIndex, setEditIndex] = useState(-1);
  const copyFormData = useRef([]);
  const closeButton = useRef(null);
  const [showValidation, toggleValidation] = useState(false);
  const onSubmit = (data, event) => {
    if (editIndex >= 0) {
      formData[editIndex] = data;
      updateFormData([...formData]);
      setEditIndex(-1);
    } else {
      // @ts-ignore
      updateFormData([...formData, ...[data]]);
    }
    console.log(event.target);
    // event.target.reset();
  };
  const type = watch('type');
  copyFormData.current = formData;

  function validate(value) {
    // @ts-ignore
    return !Object.values(copyFormData.current).find(data => data.name === value);
  }

  useEffect(
    () => {
      if (showBuilder && closeButton.current) {
        // @ts-ignore
        closeButton.current.focus();
      }
    },
    [showBuilder],
  );

  return (
    <Animate
      play={showBuilder}
      type="ease-in"
      durationSeconds={isMobile ? 0.3 : 0.5}
      startStyle={{
        transform: 'translateY(100vh)',
      }}
      endStyle={{
        transform: 'translateY(0)',
      }}
      render={({ style }) => {
        return (
          <Root style={style}>
            <div
              id="builder"
              style={{
                overflow: 'auto',
                height: '100vh',
                background: colors.primary,
              }}
            >
              <CloseButton
                aria-label="close builder"
                ref={closeButton}
                tabIndex={0}
                onClick={() => {
                  toggleBuilder(false);
                  builderButton.current.focus();
                  setHomePage();
                }}
              >
                &#10005;
              </CloseButton>
              <HeadingWithTopMargin>Builder</HeadingWithTopMargin>
              <SubHeading>Build your own form with code and example.</SubHeading>

              <Wrapper>
                <div>
                  <Title>Form</Title>

                  <SortableContainer
                    {...{ updateFormData, formData, editIndex, setEditIndex, setFormData, editFormData }}
                  />

                  {formData.length === 0 && (
                    <p
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      You can start adding fields with Fields Creator ▸
                    </p>
                  )}
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Title>Input Creator</Title>

                  <label>Name: </label>
                  <input
                    autoComplete="off"
                    defaultValue={editFormData.name}
                    name="name"
                    style={{
                      ...(errors['name'] ? errorStyle : null),
                    }}
                    ref={register({
                      required: true,
                      validate,
                    })}
                  />
                  <Animate
                    play={errors['name']}
                    durationSeconds={0.6}
                    startStyle={{
                      maxHeight: 0,
                    }}
                    endStyle={{ maxHeight: 20 }}
                  >
                    {errors.name && errors.name['type'] === 'required' && <Error>This is required.</Error>}
                    {errors.name && errors.name['type'] === 'validate' && <Error>Name required to be unique.</Error>}
                  </Animate>

                  <label>Type: </label>
                  <select name="type" ref={register} value={editFormData.type}>
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="range">Range</option>
                    <option value="search">Search</option>
                    <option value="tel">Tel</option>
                    <option value="url">url</option>
                    <option value="time">Time</option>
                    <option value="datetime">datetime</option>
                    <option value="datetime-local">datetime-local</option>
                    <option value="week">week</option>
                    <option value="month">month</option>
                    <option value="validate" disabled>
                      validate
                    </option>
                  </select>

                  {(type === 'select' ||
                    type === 'radio' ||
                    editFormData.type === 'select' ||
                    editFormData.type === 'radio') && (
                    <>
                      <label>Options:</label>
                      <input
                        key={editFormData.name}
                        defaultValue={editFormData.options}
                        type="text"
                        name="options"
                        placeholder="Enter options separate by ;"
                        ref={register}
                      />
                    </>
                  )}

                  <label>
                    <input
                      type="checkbox"
                      defaultChecked={editFormData.checkbox}
                      onClick={() => toggleValidation(!showValidation)}
                    />
                    &nbsp; Toggle Validation Panel
                  </label>

                  <Animate
                    play={showValidation}
                    startStyle={{
                      maxHeight: 0,
                      overflow: 'hidden',
                    }}
                    endStyle={{
                      maxHeight: 800,
                      overflow: 'hidden',
                    }}
                  >
                    <label>Validation</label>
                    <fieldset>
                      <label
                        style={{
                          marginTop: 0,
                        }}
                      >
                        <input defaultChecked={editFormData.required} type="checkbox" name="required" ref={register} />{' '}
                        required
                      </label>
                      <label>Max</label>
                      <input
                        defaultValue={editFormData.max}
                        autoComplete="false"
                        name="max"
                        type="number"
                        ref={register}
                      />
                      <label>Min</label>
                      <input
                        defaultValue={editFormData.min}
                        autoComplete="false"
                        name="min"
                        type="number"
                        ref={register}
                      />
                      <label>MaxLength</label>
                      <input
                        defaultValue={editFormData.maxLength}
                        autoComplete="false"
                        name="maxLength"
                        type="number"
                        ref={register}
                      />
                      <label>MinLength</label>
                      <input
                        defaultValue={editFormData.minLength}
                        autoComplete="false"
                        name="minLength"
                        type="number"
                        ref={register}
                      />
                      <label>Pattern</label>
                      <input
                        autoComplete="false"
                        defaultValue={editFormData.pattern}
                        style={{
                          marginBottom: '20px',
                        }}
                        name="pattern"
                        type="text"
                        ref={register}
                      />
                    </fieldset>
                  </Animate>

                  <SubmitButton type="submit" value={editIndex >= 0 ? 'Update' : 'Create'} />

                  <Title
                    style={{
                      fontSize: 14,
                      maxWidth: '80%',
                      margin: '20px auto 0',
                    }}
                  >
                    or
                  </Title>

                  <Animate
                    play={formData.length > 0}
                    startStyle={{
                      opacity: 0,
                      pointerEvents: 'none',
                    }}
                    endStyle={{
                      opacity: 1,
                      pointerEvents: 'auto',
                    }}
                    render={({ style }) => (
                      <SubmitButton
                        style={style}
                        type="button"
                        color="white"
                        onClick={() => {
                          toggleBuilder(false);
                          builderButton.current.focus();
                          document.body.style.overflow = 'auto';
                          HomeRef.current.scrollIntoView({ behavior: 'smooth' });
                          setHomePage();
                        }}
                        background="black"
                        value="Generate Form"
                      />
                    )}
                  />
                </Form>

                <div
                  style={{
                    paddingRight: '20px',
                    position: 'relative',
                  }}
                >
                  <Title>Code</Title>

                  <SyntaxHighlighterWithCopy data={formData} />
                </div>
              </Wrapper>
            </div>
          </Root>
        );
      }}
    />
  );
}

export default React.memo(Builder);
