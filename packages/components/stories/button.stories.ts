import React from 'react'
import { Button } from './button'
import { Meta } from '@storybook/react'

export default {
  title: 'Example/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta

const Template = args => <Button {...args} />

export const Default = Template.bind({})
Default.args = {
  label: 'default',
}
