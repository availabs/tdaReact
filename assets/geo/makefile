GENERATED_FILES = \
	states.json \
	counties.json \
	congress.json

all: $(GENERATED_FILES)

.PHONY: clean all

clean:
	rm -rf -- $(GENERATED_FILES) build

build/tl_2012_us_state.zip:
	mkdir build
	curl -o $@ 'http://www2.census.gov/geo/tiger/TIGER2012/STATE/$(notdir $@)'

build/tl_2012_us_county.zip:
	curl -o $@ 'http://www2.census.gov/geo/tiger/TIGER2012/COUNTY/$(notdir $@)'

build/tl_2012_us_cd112.zip:
	curl -o $@ 'http://www2.census.gov/geo/tiger/TIGER2012/CD/$(notdir $@)'

build/states-unfiltered.shp: build/tl_2012_us_state.zip
	rm -rf -- $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

build/counties.shp: build/tl_2012_us_county.zip
	rm -rf -- $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@


build/congress.shp: build/tl_2012_us_cd112.zip
	rm -rf -- $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# strip water states
build/states.shp: build/states-unfiltered.shp
	rm -f -- $@
	ogr2ogr -f 'ESRI Shapefile' -where "GEOID NOT IN ('02','15','72')" $@ $<

congress.json: build/congress.shp
	topojson \
		-o $@ \
		-p geoid=GEOID,name=NAMELSAD,area=+ALAND \
		-q 1e5 \
		-- $(filter %.shp,$^)

counties.json: build/counties.shp
	topojson \
		-o $@ \
		-p geoid=GEOID,name=NAME,area=+ALAND \
		-q 1e5 \
		-- $(filter %.shp,$^)

states.json: build/states.shp
	topojson \
		-o $@ \
		-p geoid=GEOID,name=NAME,area=+ALAND \
		-- $(filter %.shp,$^)