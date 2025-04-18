import './spinner.css'
import { ReactElement } from 'react'

export default Spinner

function Spinner(): ReactElement {
  return (<div
    className="spinner"
    data-testid="spinner-test-id"
  />)// eslint-disable-line react/jsx-closing-bracket-location
}
