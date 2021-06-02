import type { Meta, Story } from '@storybook/react'
import React from 'react'
import { Path } from './path'

export default {
  title: 'Components/Path',
  component: Path,
} as Meta

const Template: Story = () => <Path>/Users/1337</Path>

export const Default = Template.bind({})
Default.args = {
  children: 'default',
}
