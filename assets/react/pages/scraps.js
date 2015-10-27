<TonnageGraph 
                                        agency={this.props.currentAgency.datasource}
                                        selectedState={this.props.selectedState}
                                        filters={this.props.activeFilters} />

                                    <MadTonnageGraph 
                                        agency={this.props.currentAgency.datasource}
                                        selectedState={this.props.selectedState}
                                        filters={this.props.activeFilters} />

                                     <MadTonnageGraph 
                                        agency={this.props.currentAgency.datasource}
                                        selectedState={this.props.selectedState}
                                        filters={this.props.activeFilters} 
                                        index="2"
                                        type="season" />

                                        <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_vdt' />

                                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_length' />