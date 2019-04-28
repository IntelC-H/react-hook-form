import { Heading, SubHeading, Title } from './styles/typography';
import React from 'react';
import styled from 'styled-components';
import colors from './styles/colors';
import { AnimateGroup, Animate } from 'react-simple-animate';

const Logo = styled.svg`
  height: 80px;
  fill: white;
  top: 0;
  left: 0;
  background: #333;
  padding: 20px;
  border-radius: 15px;
  background: ${colors.lightPink};
  text-align: center;
  display: block;
  margin: -50px auto 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;

  @media (min-width: 768px) {
    height: auto;
  }

  & > h1 {
    font-size: 40px;
    text-shadow: 2px 2px 4px ${colors.lightBlue};

    @media (min-width: 768px) {
      font-size: 65px;
    }
  }

  & > p {
    font-size: 16px;
    font-weight: 100;
  }
`;

const Features = styled.div`
  margin-top: -60px;

  @media (min-width: 768px) {
    margin-top: 0;
  }

  & > h2 {
    margin-bottom: 30px;

    @media (min-width: 768px) {
      max-width: 400px;
      margin: 0 auto;
      margin-bottom: 20px;
    }
  }
`;

const FeaturesContent = styled.div`
  & h3 {
    font-weight: 400;
    font-size: 16px;
    text-align: center;
    margin-top: 10px;
  }

  & p {
    font-size: 14px;
    margin-bottom: 30px;
  }

  @media (min-width: 768px) {
    & h3 {
      font-size: 22px;
    }

    & p {
      text-align: center;
      font-size: 16px;
    }

    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 30px;
    max-width: 1010px;
    margin: 20px auto 30px;
  }
`;

const HeadingButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
  margin-top: 10px;

  @media (min-width: 768px) {
    grid-column-gap: 40px;
  }

  & > button {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    padding: 9px 20px;
    margin-bottom: 10px;
    font-size: 14px;
    background: ${colors.primary};
    color: white;
    border: 1px solid ${colors.lightBlue};
    transition: 0.3s all;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      background: ${colors.lightPink};
    }

    @media (min-width: 768px) {
      font-size: 20px;
      padding: 12px 20px;
      font-weight: 300;
      margin-bottom: 40px;
    }
  }
`;

export default function Header({ homeRef, toggleApi, tabIndex }: any) {
  return (
    <AnimateGroup play>
      <Head>
        <Logo viewBox="0 0 100 100">
          <path d="M73.56,13.32H58.14a8.54,8.54,0,0,0-16.27,0H26.44a11,11,0,0,0-11,11V81.63a11,11,0,0,0,11,11H73.56a11,11,0,0,0,11-11V24.32A11,11,0,0,0,73.56,13.32Zm-30.92,2a1,1,0,0,0,1-.79,6.54,6.54,0,0,1,12.78,0,1,1,0,0,0,1,.79h5.38v6.55a3,3,0,0,1-3,3H40.25a3,3,0,0,1-3-3V15.32ZM82.56,81.63a9,9,0,0,1-9,9H26.44a9,9,0,0,1-9-9V24.32a9,9,0,0,1,9-9h8.81v6.55a5,5,0,0,0,5,5h19.5a5,5,0,0,0,5-5V15.32h8.81a9,9,0,0,1,9,9Z" />
          <path style={{ transform: 'translateX(-25px)' }} d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
          <path d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
          <path style={{ transform: 'translateX(-25px)' }} d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
          <path d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
        </Logo>
        <Heading>React Hook Form</Heading>
        <SubHeading>Performance, flexible and extensible forms with easy to use for validation.</SubHeading>

        <HeadingButtons>
          <button
            tabIndex={tabIndex}
            onClick={() => {
              if (homeRef.current) {
                // @ts-ignore
                homeRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Demo
          </button>
          <button
            tabIndex={tabIndex}
            onClick={() => {
              toggleApi(true);
              document.title = 'React hook form - API';
              window.history.pushState({ page: 'React hook form - API' }, 'React hook form - API', '/api');
            }}
          >
            Get Started
          </button>
        </HeadingButtons>
      </Head>

      <Features>
        <Title>Features</Title>
        <FeaturesContent>
          <Animate delaySeconds={0.5} startStyle={{ opacity: 0 }} endStyle={{opacity: 1}} sequenceIndex={0}>
            <svg
              version="1.1"
              x="0px"
              y="0px"
              viewBox="0 0 64 80"
              style={{
                fill: 'white',
                width: 40,
                display: 'block',
                margin: '0 auto'
              }}
            >
              <g display="none">
                <rect x="63.988" y="-188.006" display="inline" fill="#000000" width="20" height="430" />
                <rect
                  x="374.488"
                  y="-437.506"
                  transform="matrix(1.067751e-10 -1 1 1.067751e-10 310.4941 458.4824)"
                  display="inline"
                  fill="#000000"
                  width="20"
                  height="1023"
                />
                <rect x="-54.031" y="-205.674" display="inline" fill="#000000" width="947.424" height="496.184" />
              </g>
              <g display="none">
                <g display="inline">
                  <g>
                    <path d="M16.031,27v3.843h3.705V27h2.243v10h-2.243v-4.184h-3.705V37h-2.258V27H16.031z" />
                  </g>
                  <g>
                    <path d="M25.712,28.899h-2.672V27h7.647v1.899h-2.716V37h-2.259V28.899z" />
                  </g>
                  <g>
                    <path d="M40.088,33.171c-0.045-1.201-0.089-2.655-0.089-4.109h-0.043c-0.311,1.275-0.723,2.7-1.107,3.872l-1.211,3.902h-1.757     l-1.063-3.872c-0.325-1.172-0.664-2.597-0.9-3.902h-0.03c-0.059,1.35-0.102,2.892-0.177,4.139L33.534,37h-2.08l0.634-10h2.996     l0.974,3.337c0.311,1.158,0.621,2.405,0.842,3.577h0.043c0.28-1.158,0.621-2.479,0.945-3.591L38.951,27h2.938l0.546,10h-2.199     L40.088,33.171z" />
                  </g>
                  <g>
                    <path d="M44.013,27h2.258v8.101h3.956V37h-6.213V27z" />
                  </g>
                </g>
                <g display="inline">
                  <g>
                    <g>
                      <path d="M49.621,2C52.587,2,55,4.413,55,7.379v49.241C55,59.587,52.587,62,49.621,62H14.379C11.413,62,9,59.587,9,56.621V7.379      C9,4.413,11.413,2,14.379,2H49.621 M49.621,0H14.379C10.304,0,7,3.304,7,7.379v49.241C7,60.696,10.304,64,14.379,64h35.241      C53.696,64,57,60.696,57,56.621V7.379C57,3.304,53.696,0,49.621,0L49.621,0z" />
                    </g>
                  </g>
                  <g>
                    <line
                      fill="none"
                      stroke="#000000"
                      x1="22.153"
                      y1="0.707"
                      x2="7.817"
                      y2="15.046"
                    />
                    <line
                      fill="none"
                      stroke="#000000"
                      x1="56.183"
                      y1="48.954"
                      x2="41.847"
                      y2="63.293"
                    />
                  </g>
                </g>
              </g>
              <g display="none">
                <g display="inline">
                  <polygon points="19.736,30.843 16.031,30.843 16.031,27 13.773,27 13.773,37 16.031,37 16.031,32.816 19.736,32.816 19.736,37     21.98,37 21.98,27 19.736,27   " />
                  <polygon points="23.041,28.899 25.712,28.899 25.712,37 27.971,37 27.971,28.899 30.687,28.899 30.687,27 23.041,27   " />
                  <path d="M38.951,27l-1.063,3.323c-0.324,1.113-0.664,2.434-0.945,3.591H36.9c-0.221-1.172-0.532-2.419-0.843-3.577L35.084,27    h-2.996l-0.634,10h2.08l0.177-3.798c0.075-1.247,0.118-2.789,0.177-4.139h0.03c0.236,1.305,0.575,2.73,0.9,3.902l1.063,3.872    h1.757l1.211-3.902c0.384-1.172,0.797-2.597,1.107-3.872h0.043c0,1.454,0.045,2.908,0.089,4.109L40.236,37h2.199l-0.546-10H38.951    z" />
                  <polygon points="46.271,27 44.013,27 44.013,37 50.227,37 50.227,35.101 46.271,35.101   " />
                  <path d="M49.621,0H14.379C10.304,0,7,3.304,7,7.379v49.241C7,60.696,10.304,64,14.379,64h35.242C53.696,64,57,60.696,57,56.621    V7.379C57,3.304,53.696,0,49.621,0z M14.379,1h6.774L8,14.156V7.379C8,3.862,10.862,1,14.379,1z M49.621,63h-6.773L56,49.844    v6.777C56,60.138,53.138,63,49.621,63z M56,48.772l-0.171-0.171L41.494,62.939L41.555,63H14.379C10.862,63,8,60.138,8,56.621    V15.229l0.171,0.171L22.506,1.061L22.446,1h27.175C53.138,1,56,3.862,56,7.379V48.772z" />
                </g>
              </g>
              <g>
                <g>
                  <path d="M7,7.379v7.07L21.447,0h-7.067C10.304,0,7,3.304,7,7.379z" />
                  <path d="M49.621,64C53.696,64,57,60.696,57,56.621v-7.07L42.553,64H49.621z" />
                  <path d="M49.621,0H24.275L7,17.277v39.344C7,60.696,10.304,64,14.379,64h25.346L57,46.723V7.379C57,3.304,53.696,0,49.621,0z     M21.98,37h-2.243v-4.184h-3.705V37h-2.258V27h2.258v3.843h3.705V27h2.243V37z M30.687,28.899h-2.716V37h-2.259v-8.101h-2.672V27    h7.647V28.899z M40.236,37l-0.148-3.828c-0.045-1.201-0.089-2.655-0.089-4.109h-0.043c-0.311,1.275-0.723,2.7-1.107,3.872    l-1.211,3.902h-1.757l-1.063-3.872c-0.325-1.172-0.664-2.597-0.9-3.902h-0.03c-0.059,1.35-0.102,2.892-0.177,4.139L33.534,37    h-2.08l0.634-10h2.996l0.974,3.337c0.311,1.158,0.621,2.405,0.843,3.577h0.043c0.28-1.158,0.621-2.479,0.945-3.591L38.951,27    h2.938l0.546,10H40.236z M50.227,37h-6.213V27h2.258v8.101h3.956V37z" />
                </g>
              </g>
            </svg>
            <h3>HTML standard</h3>
            <p>Leverage your existing HTML markup, and start validating your forms with standard validation.</p>
          </Animate>

          <Animate startStyle={{ opacity: 0 }} endStyle={{opacity: 1}} sequenceIndex={1}>
            <svg
              viewBox="0 0 100 125"
              style={{
                fill: 'white',
                width: 45,
                display: 'block',
                margin: '0 auto'
              }}
            >
              <path d="M5,92.196c0,0,9.342-8.233,12.888-11.816c0.097-0.1,0.2-0.208,0.297-0.312c10.855,4.003,32.667-5.268,52.239-22.641  c0.577-0.497,0.479-0.28,1.024-0.795l-20.956-4.658l27.153-1.737l0.293-0.246C98.634,30.786,94.702,7.803,94.702,7.803  s-25.642,0.3-46.966,12.71l-1.578,20.272l-5.047-15.733c-1.352,1-1.791,1.295-3.083,2.421c-4.546,4.005-7.771,7.382-11.265,11.511  l2.401,15.721l-7.488-9.461c-9.515,13.243-12.903,25.574-7.898,31.79c-0.565,0.749-1.129,1.548-1.689,2.392  C7.368,86.518,5,92.196,5,92.196z M17.442,76.457c0,0,26.146-40.739,70.729-58.628C88.171,17.829,47.99,39.296,17.442,76.457z" />
            </svg>
            <h3>Super Light</h3>
            <p>Performance is important and packages size matters. it is tiny and without any dependencies.</p>
          </Animate>

          <Animate startStyle={{ opacity: 0 }} endStyle={{opacity: 1}} sequenceIndex={2}>
            <svg
              data-name="Layer 1"
              viewBox="0 0 24 30"
              x="0px"
              y="0px"
              style={{
                fill: 'white',
                width: 50,
                display: 'block',
                margin: '0 auto'
              }}
            >
              <title>rounded</title>
              <path d="M20.87469,10.47565a9.00465,9.00465,0,1,0-10.399,10.399A8.99479,8.99479,0,0,0,20.87469,10.47565ZM18.669,16.40247a1.9419,1.9419,0,0,1-2.5022.62738,8.94432,8.94432,0,0,0-8.33319-.00019,1.94287,1.94287,0,0,1-2.50366-.6289A7.95274,7.95274,0,0,1,4.09424,10.761,8.00112,8.00112,0,0,1,20,12,7.92283,7.92283,0,0,1,18.669,16.40247Zm-1.81543-9.256a.49983.49983,0,0,1,0,.707l-3.90271,3.90271A.96262.96262,0,0,1,13,12a1,1,0,1,1-1-1,.96262.96262,0,0,1,.24377.04919l3.90271-3.90271A.49983.49983,0,0,1,16.85352,7.14648Z" />
            </svg>

            <h3>Performance</h3>
            <p>
              Minimizes the volume that is triggered re-rendering, try to provide your users with the best experience.
            </p>
          </Animate>

          <Animate startStyle={{ opacity: 0 }} endStyle={{opacity: 1}} sequenceIndex={3}>
            <svg x="0px" y="0px" viewBox="0 0 100 125" style={{
              fill: 'white',
              width: 50,
              display: 'block',
              margin: '0 auto'
            }}>
              <path
                d="M95.934,26.48l-3.713,8.296c-1.01,1.928-2.794,3.025-5.35,3.293h-1.395  c-1.708-0.105-3.567-0.14-5.577-0.105c-2.429,0.395-4.59,0.912-6.483,1.551c-1.511,0.5-3.027,0.576-4.55,0.227  c-0.615-0.174-1.487-0.512-2.614-1.011c-0.418-0.209-1.487-0.931-3.207-2.162c-1.789-1.29-3.485-2.329-5.089-3.119  c-1.405-0.768-4.101-2.046-8.087-3.835c-2.277-1.104-3.753-2.097-4.426-2.979c-0.663-0.895-0.75-1.976-0.262-3.242  c0.267-0.72,0.808-1.255,1.621-1.604c1.138-0.581,2.498-0.535,4.079,0.14c1.904,0.86,3.224,1.453,3.956,1.778  c1.29,0.581,3.317,1.325,6.082,2.23c0.942,0.291,1.883,0.489,2.823,0.593h1.203l-1.08-0.488c-6.356-2.916-10.533-4.799-12.531-5.647  c-1.952-0.813-3.643-0.941-5.072-0.382c-1.383,0.581-2.335,1.417-2.858,2.509c-0.279,0.616-0.471,1.447-0.575,2.492  c-0.744-0.046-2.26-0.111-4.549-0.192c-4.799,2.313-7.401,3.544-7.808,3.695c-0.941,0.314-1.906,0.488-2.893,0.523  c-1.081-0.024-1.876-0.216-2.388-0.576c-0.604-0.255-1.034-0.895-1.29-1.917c-0.175-1.047,0.737-2.179,2.736-3.399l10.596-6.867  c5.101-0.603,10.08-1.423,14.937-2.457c1.068-0.244,2.103-0.145,3.102,0.296c3.115,1.604,6.659,3.23,10.632,4.88  c1.977,0.813,3.887,1.575,5.734,2.284c3.277,1.057,6.024,1.667,8.244,1.83h0.018c2.439,0.023,7.784-0.941,16.034-2.894  C98.606,19.631,98.606,21.717,95.934,26.48z"
              />
              <path
                d="M25.73,31.831c3.405,5.019,6.298,10.091,8.68,15.215  c3.764,8.168,5.49,15.047,5.176,20.636c-0.058,0.302-0.209,0.604-0.453,0.906c-0.348,0.384-0.604,0.61-0.767,0.68  c-4.276,1.371-8.511,1.731-12.706,1.081c-6.309-1.139-11.741-4.619-16.295-10.439c0.825-7.576,2.347-13.485,4.566-17.726  l2.962-4.113C19.567,35.154,22.512,33.075,25.73,31.831z"
              />
              <path
                d="M79.011,48.388c-0.709-0.917-1.587-1.476-2.632-1.672  c-9.572,0.235-14.992-1.101-16.261-4.009c-2.406-5.798-6.397-9.499-11.974-11.102c-5.577-1.592-11.648-0.93-18.213,1.986  c2.893,4.613,5.287,9.132,7.18,13.56c3.509,7.878,5.072,14.617,4.688,20.218c0,1.022-0.389,1.992-1.167,2.91  c-0.686,0.93-1.511,1.546-2.475,1.849c-3.01,1.01-7.129,1.301-12.357,0.871c-5.24-0.442-10.904-3.167-16.993-8.175  c-1.385,6.83-2.799,11.271-4.244,13.324c14.306,8.29,28.217,12.767,41.733,13.429c2.091-7.355,3.184-11.137,3.277-11.346  c0.523-1.36,0.837-2.133,0.941-2.318c0.244-0.406,0.546-0.784,0.906-1.133c0.789-0.778,1.69-1.243,2.702-1.395  c5.959-0.813,11.095-2.66,15.406-5.542c6.519-4.321,9.997-10.521,10.439-18.597C80.063,50.224,79.742,49.271,79.011,48.388z   M53.181,50.445c-0.686,0.674-1.51,1.01-2.475,1.01c-0.988,0-1.818-0.336-2.493-1.01c-0.685-0.674-1.028-1.505-1.028-2.492  c0-0.977,0.343-1.802,1.028-2.475c0.674-0.674,1.504-1.012,2.493-1.012c0.965,0,1.789,0.337,2.475,1.012  c0.675,0.673,1.012,1.498,1.012,2.475C54.192,48.939,53.855,49.771,53.181,50.445z"
              />
            </svg>
            <h3>Adoptable</h3>
            <p>Since form state is inherently local, it can be easily adopted without other dependencies.</p>
          </Animate>
        </FeaturesContent>
      </Features>
    </AnimateGroup>
  );
}
