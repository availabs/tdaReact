module.exports = {
  connection:'hpms',
  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    table_name: 'STRING',
    state_fips: 'INTEGER',
    data_year: 'INTEGER',

    min_aadt: 'INTEGER',
    max_aadt: 'INTEGER',

    min_type1: 'INTEGER',
    max_type1: 'INTEGER',

    min_type2: 'INTEGER',
    max_type2: 'INTEGER',

    min_type3: 'INTEGER',
    max_type3: 'INTEGER',

    min_type4: 'INTEGER',
    max_type4: 'INTEGER',

    min_type5: 'INTEGER',
    max_type5: 'INTEGER',

    min_type6: 'INTEGER',
    max_type6: 'INTEGER',

    min_type7: 'INTEGER',
    max_type7: 'INTEGER'
  }

};