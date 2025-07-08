 
import { ReactElement } from 'react'

export default function Stepper({ currentStep, steps }: StepperProps): ReactElement {
  const currentStepData = steps[currentStep - 1]
  const nextStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length

  return (
    <div className="fr-stepper">
      <h2 className="fr-stepper__title">
        {currentStepData.title}
        <span className="fr-stepper__state">
          Étape 
          {' '}
          {currentStep}
          {' '}
          sur 
          {' '}
          {steps.length}
        </span>
      </h2>
      <div
        className="fr-stepper__steps"
        data-fr-current-step={currentStep}
        data-fr-steps={steps.length}
      />
      {!isLastStep && (
        <p className="fr-stepper__details">
          <span className="fr-text--bold">
            Étape suivante :
          </span>
          {' '}
          {nextStepData.title}
        </p>
      )}
    </div>
  )
}

type StepperProps = Readonly<{
  currentStep: number
  steps: ReadonlyArray<Readonly<{
    isCompleted?: boolean
    title: string
  }>>
}>