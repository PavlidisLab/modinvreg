/*
 * The rdp project
 * 
 * Copyright (c) 2014 University of British Columbia
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package ubc.pavlab.rdp.server.controller;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import gemma.gsec.authentication.UserDetailsImpl;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import ubc.pavlab.rdp.server.model.Researcher;
import ubc.pavlab.rdp.server.model.common.auditAndSecurity.User;
import ubc.pavlab.rdp.server.security.authentication.UserManager;
import ubc.pavlab.rdp.server.security.authentication.UserService;
import ubc.pavlab.rdp.server.service.ResearcherService;
import ubc.pavlab.rdp.testing.BaseSpringContextTest;

/**
 * TODO Document Me
 * 
 * @author mjacobson
 * @version $Id$
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
public class RegisterControllerTest extends BaseSpringContextTest {

    @Autowired
    private RegisterController registerController;

    @Autowired
    private ResearcherService researcherService;

    @Autowired
    private UserService userService;

    @Autowired
    UserManager userManager;

    @Autowired
    private WebApplicationContext wac;

    private Researcher researcher;

    private MockMvc mockMvc;

    private String email = "foobar@email.com";
    private String username = "foobar";
    private String department = "dept";

    private User createUser( String username, String email ) {
        User testContact = new User();
        testContact.setUserName( username );
        testContact.setEmail( email );
        testContact.setEnabled( true );
        userManager.createUser( new UserDetailsImpl( testContact ) );
        testContact = ( User ) userService.findByEmail( email );
        return testContact;
    }

    private Researcher createResearcher( String username, String email, String department ) {
        User testContact = createUser( username, email );

        Researcher testResearcher = new Researcher();
        testResearcher = new Researcher();
        testResearcher.setContact( testContact );
        testResearcher.setDepartment( department );
        return researcherService.create( testResearcher );
    }

    @Before
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup( this.wac ).build();
        researcher = createResearcher( username, email, department );
    }

    @After
    public void tearDown() {
        researcherService.delete( researcher );
        assertNull( researcherService.findByEmail( email ) );
        assertNull( userService.findByEmail( email ) );
    }

    @Test
    public void testLoadUser() throws Exception {
        try {
            super.runAsUser( researcher.getContact().getUserName() );
            researcher.getContact().setFirstName( "firstname" );
            researcher.getContact().setLastName( "lastname" );
            researcher.setOrganization( "organization" );
            researcherService.update( researcher );
            this.mockMvc.perform( put( "/loadResearcher.html" ).contentType( MediaType.APPLICATION_JSON ) )
                    .andExpect( status().isOk() ).andExpect( jsonPath( "$.success" ).value( true ) )
                    .andExpect( jsonPath( "$.data.contact.firstName" ).value( "firstname" ) )
                    .andExpect( jsonPath( "$.data.contact.lastName" ).value( "lastname" ) )
                    .andExpect( jsonPath( "$.data.contact.userName" ).value( "foobar" ) )
                    .andExpect( jsonPath( "$.data.contact.email" ).value( "foobar@email.com" ) )
                    .andExpect( jsonPath( "$.data.department" ).value( "dept" ) )
                    .andExpect( jsonPath( "$.data.organization" ).value( "organization" ) );
        } catch ( Exception e ) {
            fail( e.getMessage() );
        } finally {
            super.runAsAdmin();
        }
    }

    @Test
    public void testSaveResearcher() throws Exception {
        try {
            super.runAsUser( researcher.getContact().getUserName() );
            this.mockMvc
                    .perform(
                            put( "/saveResearcher.html" ).contentType( MediaType.APPLICATION_JSON )
                                    .param( "firstName", "afirstname" ).param( "lastName", "alastname" )
                                    .param( "organization", "aorganization" ).param( "department", "adepartment" )
                                    .param( "website", "http://awebsite.com" ).param( "phone", "a111-111-1111" )
                                    .param( "description", "adescription" ) ).andExpect( status().isOk() )
                    .andExpect( jsonPath( "$.success" ).value( true ) );
            researcher = researcherService.findByUserName( researcher.getContact().getUserName() );
            assertEquals( "foobar", researcher.getContact().getUserName() );
            assertEquals( "afirstname", researcher.getContact().getFirstName() );
            assertEquals( "alastname", researcher.getContact().getLastName() );
            assertEquals( "aorganization", researcher.getOrganization() );
            assertEquals( "adepartment", researcher.getDepartment() );
            assertEquals( "http://awebsite.com", researcher.getWebsite() );
            assertEquals( "a111-111-1111", researcher.getPhone() );
            assertEquals( "adescription", researcher.getDescription() );

        } catch ( Exception e ) {
            fail( e.getMessage() );
        } finally {
            super.runAsAdmin();
        }
    }

    @Test
    public void testLoadAllResearchers() throws Exception {
        Researcher researcher2 = null;
        try {
            int numResearchers = researcherService.loadAll().size();
            researcher2 = createResearcher( "foobar2", "foobar2@email.com", "dept2" );
            researcher2.getContact().setFirstName( "firstname2" );
            researcher2.getContact().setLastName( "lastname2" );
            researcher2.setOrganization( "organization2" );
            researcherService.update( researcher2 );

            researcher.getContact().setFirstName( "firstname" );
            researcher.getContact().setLastName( "lastname" );
            researcher.setOrganization( "organization" );
            researcherService.update( researcher );
            MockHttpServletResponse response = this.mockMvc
                    .perform( put( "/loadAllResearchers.html" ).contentType( MediaType.APPLICATION_JSON ) )
                    .andExpect( status().isOk() ).andReturn().getResponse();
            JSONObject json = new JSONObject( response.getContentAsString() );
            assertEquals( true, json.getBoolean( "success" ) );
            JSONArray data = json.getJSONArray( "data" );

            assertEquals( numResearchers + 1, data.length() );

            int conditionBits = 0;
            for ( int i = 0; i < data.length(); i++ ) {
                JSONObject res = data.getJSONObject( i );
                JSONObject cont = res.getJSONObject( "contact" );
                if ( cont.getString( "email" ).equals( "foobar2@email.com" ) ) {
                    conditionBits = conditionBits | ( 1 << 0 );
                    assertEquals( "firstname2", cont.getString( "firstName" ) );
                    assertEquals( "lastname2", cont.getString( "lastName" ) );
                    assertEquals( "foobar2", cont.getString( "userName" ) );
                    assertEquals( "dept2", res.getString( "department" ) );
                    assertEquals( "organization2", res.getString( "organization" ) );
                } else if ( cont.getString( "email" ).equals( "foobar@email.com" ) ) {
                    conditionBits = conditionBits | ( 1 << 1 );
                    assertEquals( "firstname", cont.getString( "firstName" ) );
                    assertEquals( "lastname", cont.getString( "lastName" ) );
                    assertEquals( "foobar", cont.getString( "userName" ) );
                    assertEquals( "dept", res.getString( "department" ) );
                    assertEquals( "organization", res.getString( "organization" ) );
                }
            }

            // Check if both were found
            assertEquals( 3, conditionBits );

        } catch ( Exception e ) {
            fail( e.getMessage() );
        } finally {
            researcherService.delete( researcher2 );
        }
    }

    @Test
    public void testDeleteUser() throws Exception {
        Researcher researcher2 = null;
        try {
            researcher2 = createResearcher( "foobar2", "foobar2@email.com", "dept2" );
            researcherService.update( researcher2 );

            Researcher r = researcherService.findByEmail( "foobar2@email.com" );

            assertNotNull( r );

            this.mockMvc
                    .perform(
                            put( "/deleteUser.html" ).contentType( MediaType.APPLICATION_JSON ).param( "userName",
                                    "foobar2" ) ).andExpect( status().isOk() )
                    .andExpect( jsonPath( "$.success" ).value( true ) );

            r = researcherService.findByEmail( "foobar2@email.com" );

            assertNull( r );

        } catch ( Exception e ) {
            fail( e.getMessage() );
            researcherService.delete( researcher2 );
        }
    }
}