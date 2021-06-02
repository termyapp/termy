import type { Meta, Story } from '@storybook/react'
import React from 'react'
import { Button } from './button'

export default {
  title: 'Components/Button',
  component: Button,
} as Meta

export const Template: Story = () => <Button>Click Me</Button>
